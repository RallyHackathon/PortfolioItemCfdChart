This is a burndown chart that was created during the 2012 RallyOn Hackathon. It requires the Lookback API to function.

Since this app was created as part of the hackathon it is not guaranteed to work. Inorder to get the charts to display we used some unsupported early release components. In the near future the SDK will have first class support for charting.

This Rakefile can be used to create a skeleton Rally app for use with Rally's App SDK.  You must have Ruby and the rake gem installed.

Available tasks are:

    rake build                      # Build a deployable app which includes all JavaScript and CSS resources inline
    rake clean                      # Clean all generated output
    rake debug                      # Build a debug version of the app, useful for local development
    rake jslint                     # Run jslint on all JavaScript files used by this app
    rake new[app_name,sdk_version]  # Create an app with the provided name (and optional SDK version)
    
You can find more information on installing Ruby and using rake tasks to simplify app development here: https://rally1.rallydev.com/apps/2.0p/doc/#!/guide/appsdk_20_starter_kit