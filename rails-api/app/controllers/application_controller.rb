class ApplicationController < ActionController::API
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def create_session(user)
    user.update_tracked_fields(request)
    user.sessions.create({
      authentication_token: SecureRandom.hex(16),
      ip: request.remote_ip,
      user_agent: request.env.fetch('HTTP_USER_AGENT', 'Unknown')
    })
  end

  def session_json(user:, session:)
    {
      session: {
        authentication_key: session.authentication_key,
        authentication_token: session.authentication_token,
        user_agent: session.user_agent,
        ip: session.ip,
        created_at: session.created_at
      },
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        admin: user.admin?,
        avatar: user.data_avatar
      },
      success: true
    }
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.for(:sign_up) do |u|
      u.permit(
        :email,
        :password,
        :first_name,
        :last_name
      )
    end
    devise_parameter_sanitizer.for(:account_update) do |u|
      u.permit(
        :email,
        :password,
        :password_confirmation,
        :first_name,
        :last_name,
        :current_password
      )
    end
  end
end
