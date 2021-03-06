class AuthenticatedController < ApplicationController
  before_action :authenticate_user_from_token
  helper_method :current_user
  respond_to :json

  protected

  def authenticate_user_from_token
    auth_key   = request.headers.fetch('HTTP_X_AUTHENTICATION_KEY')
    auth_token = request.headers.fetch('HTTP_X_AUTHENTICATION_TOKEN')

    active_session = Session.active.find_by(authentication_key: auth_key)

    if active_session && Devise.secure_compare(active_session.authentication_token, auth_token)
      @current_user ||= active_session.user
    else
      render json: {success: false, message: 'You must sign in or up before continuing'}, status: 401 and return
    end
  end

  private

  attr_reader :current_user
end
