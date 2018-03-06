# Users

We don't want to create authorized REST API users manually from the commandline. That's only great for testing purposes.
Instead we want to be able to specify in the webserver where the users can be found. This is what user repositories in web servers are for.

### Glassfish User Repository
Glassfish will be depricated and therefore no part of this tutorial.

### Apache Tomcat User Repository
Currently, we can't use a Tomcat User Repository. There is currently a bug in ORDS (current version 17.4.1):

https://community.oracle.com/thread/4084028

### Weblogic User Repository
A paid licence is needed for Weblogic and therefore no part of this tutorial.

## JDBC Realm
