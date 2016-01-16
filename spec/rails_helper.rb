ENV['RAILS_ENV'] ||= 'test'
require 'spec_helper'
require File.expand_path('../../config/environment', __FILE__)
require 'rspec/rails'
require 'capybara/rails'
require 'database_cleaner'
require 'support/hide_seed'

Selenium::WebDriver::Chrome::Service.executable_path = ENV.fetch('CHROME_DRIVER', '/usr/local/bin/chromedriver')
Capybara.register_driver :chrome do |app|
  Capybara::Selenium::Driver.new(app, browser: :chrome, switches: %w[—-test-type --no-sandbox])
end
Capybara.javascript_driver = :chrome

ActiveRecord::Migration.maintain_test_schema!

RSpec.configure do |config|
  config.order         = :random
  config.detail_color  = :blue
  config.success_color = :blue

  config.include FactoryGirl::Syntax::Methods
  config.infer_spec_type_from_file_location!

  # Database Cleaner
  config.use_transactional_fixtures = false
  config.before(:suite) do
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do |example|
    DatabaseCleaner.strategy= example.metadata[:js] ? :truncation : :transaction
    DatabaseCleaner.start
  end

  config.after(:each) do
    DatabaseCleaner.clean
  end
end
