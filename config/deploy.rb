require 'mina/bundler'
require 'mina/rails'
require 'mina/git'
require 'mina/rvm'

set :repository, 'ssh://git@github.com/dillonhafer/budgetal.git'
set :git_revision_file, 'REVISION'

case ENV['to']
when 'beta'
  set :domain, 'beta.budgetal.com'
  set :deploy_to, '/var/www/budgetal-beta'
  set :branch, 'beta'
  set :rails_env, 'beta'
else
  ENV['to'] = 'production'
  set :domain, 'www.budgetal.com'
  set :deploy_to, '/var/www/budgetal-production'
  set :branch, 'master'
  set :rails_env, 'production'
end

# This task is the environment that is loaded for most commands, such as
# `mina deploy` or `mina rake`.
task :environment do
  invoke :'rvm:use[ruby-2.2.1@budgetal]'
  invoke :'frontend:load_nvm'
end

# Run `mina setup` to create these paths on your server.
# They will be linked in the 'deploy:link_shared_paths' step.
set :shared_paths, ['.env', 'log', 'tmp/pids', 'tmp/cache', 'node_modules']

set :user, 'deployer'
set :keep_releases, 4

# Put any custom mkdir's in here for when `mina setup` is ran.
# For Rails apps, we'll make some of the shared paths that are shared between
# all releases.
task setup: :environment do
  queue! %[mkdir -p "#{deploy_to}/db-backups"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/db-backups"]

  queue! %[mkdir -p "#{deploy_to}/shared"]
  queue! %[touch "#{deploy_to}/shared/.env"]

  queue! %[mkdir -p "#{deploy_to}/shared/log"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/shared/log"]

  queue! %[mkdir -p "#{deploy_to}/shared/tmp/pids"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/shared/tmp/pids"]

  queue! %[mkdir -p "#{deploy_to}/shared/tmp/cache"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/shared/tmp/cache"]

  queue! %[mkdir -p "#{deploy_to}/shared/node_modules"]
  queue! %[chmod g+rx,u+rwx "#{deploy_to}/shared/node_modules"]
end

desc 'Make sure local git is in sync with remote.'
task :check_revision do
  unless `git rev-parse HEAD` == `git rev-parse origin/#{branch}`
    puts "WARNING: HEAD is not the same as origin/#{branch}"
    puts "Run `git push` to sync changes."
    exit
  end
end

desc "Deploys the App."
task deploy: :environment do
  deploy do
    invoke :'check_revision'
    invoke :'git:clone'
    invoke :'deploy:link_shared_paths'
    invoke :'bundle:install'
    invoke :'rails:db_migrate'
    invoke :'frontend:build'
    invoke :'rails:assets_precompile'

    to :launch do
      invoke :'passenger:restart'
    end

    invoke :'deploy:cleanup'
  end
end

namespace :frontend do
  desc 'Load NVM and node 4.1.1'
  task :load_nvm do
    queue! %[source ~/.nvm/nvm.sh && nvm use 4.1.1]
  end

  desc "Install npm dependencies"
  task :install do
    queue check_for_changes_script \
        check: 'package.json',
        at: ['package.json'],
        skip: %[echo "-----> Skipping npm installation"],
        changed: %[
          echo "-----> #{message}"
          #{echo_cmd %[NODE_ENV=#{ENV['to']} npm install]}
        ],
        default: %[
          echo "-----> Installing npm modules"
          #{echo_cmd %[NODE_ENV=#{ENV['to']} npm install]}
        ]
  end

  desc "Compile Webpack assets"
  task build: :install do
    queue check_for_changes_script \
        check: 'app/frontend',
        at: ['app/frontend'],
        skip: %[
          echo "-----> Skipping webpack build; using previous one"
          #{echo_cmd %[cp ../../current/app/assets/javascripts/react_bundle.js app/assets/javascripts/]}
        ],
        changed: %[
          echo "-----> Building react assets"
          #{echo_cmd %[NODE_ENV=#{ENV['to']} npm run build]}
        ],
        default: %[
          echo "-----> Building react assets"
          #{echo_cmd %[NODE_ENV=#{ENV['to']} npm run build]}
        ]
  end
end

namespace :logs do
  desc "Follows the log file."
  task :rails do
    queue 'echo "Contents of the log file are as follows:"'
    queue "tail -f #{deploy_to}/current/log/#{ENV['to']}.log"
  end
end

namespace :run do
  desc "Runs a rails console session."
  task :console do
    queue "cd #{deploy_to}/current ; bundle exec rails console #{ENV['to']}"
  end
end

namespace :pg do
  desc "Creates a postgres backup."
  task backup: :environment do
    backup_date = Time.now.strftime("%Y%m%d%H%M%S")
    command     = "pg_dump -Fc budgets > #{deploy_to}/db-backups/#{backup_date}.dump"
    queue "echo -e '\e[32m----->\e[0m Dumping database\n       #{command}'"
    queue command
  end
end

namespace :passenger do
  task :restart do
    queue %{
      echo "-----> Restarting passenger"
      #{echo_cmd %[mkdir -p tmp]}
      #{echo_cmd %[touch tmp/restart.txt]}
    }
  end
end

namespace :maintenance do
  task :on do
    queue %{
      echo "-----> Enabling maintenance mode"
      #{echo_cmd %[touch #{deploy_to}/current/public/maintenance]}
    }
  end

  task :off do
    queue %{
      echo "-----> Disabling maintenance mode"
      #{echo_cmd %[rm #{deploy_to}/current/public/maintenance]}
    }
  end
end
