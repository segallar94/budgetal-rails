class Api::SessionsController < AuthenticatedController
  skip_before_action :authenticate_user_from_token, only: [:create]
  respond_to :json

  def create
    user = User.find_for_database_authentication(
      email: params[:user][:email]
    )
    return invalid_login_attempt unless user

    if user.valid_password?(params[:user][:password])
      expire_sessions(user)

      active_session = user.sessions.create({
        authentication_token: SecureRandom.hex(16),
        ip: request.remote_ip,
        user_agent: request.env.fetch('HTTP_USER_AGENT', 'Unknown')
      })

      render json: {
        session: {
          authentication_key: active_session.authentication_key,
          authentication_token: active_session.authentication_token
        },
        user: {
          first_name: user.first_name,
          admin: user.admin?
        },
        success: true,
      }
      return
    end
    invalid_login_attempt
  end

  def destroy
    sign_out_session(current_user)
    render json: {success: true, message: 'You are now signed out.'}
  end

  protected

  def expire_sessions(user)
    user.sessions.active.update_all(expired_at: Time.now)
  end

  def sign_out_session(user)
    user.sessions.active.find_by_authentication_key(request.headers.fetch('HTTP_X_AUTHENTICATION_KEY'))
      .update_attributes(expired_at: Time.now)
  end

  def invalid_login_attempt
    warden.custom_failure!
    render json: {
      success: false,
      message: "Incorrect email or password"
    }, status: 401
  end
end
