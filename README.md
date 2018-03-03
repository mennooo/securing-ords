# securing-ords
How to secure a REST API build with Oracle REST Data Services (ORDS)

## Demo API
A demo that makes the sence is securing a REST API for an E-commerce application.

We are a an online store that sells clothes to customers. We will base the API on data from a **Packaged App** in Oracle APEX: the **Sample Database Application**.

For this demo we see how the authorization works in three steps
1. Using the API via Postman with Basic Authentication
2. Using the API via Postman with Oauth2
3. Using the API via a web application with Oauth2

For the last step we build our E-commerce application using Oracle Jet application because then it makes sence to use a REST API. The Oracle JET API provides the oj.OAuth authorization plugin which supports the OAuth 2.0 open protocol.

The goal is to create a REST API for the E-commerce application to let customers:
- See products (not secured)
- Create an account (not secured)
- Place new orders
- See order history

## Basic authentication
The endpoint requires a user to specify there username and password. If it's not present in the request header, the user will be redirected to an ORDS login page first.

The users must be created on the ORDS webserver.

```bash
java -jar ords.war user emp_user emp_role
Enter a password for user emp_user:
Confirm password for user emp_user:
```

## Oauth2 protocol

### Resource owner
The E-commerce store

### Resource server
ORDS webserver

### Client
The customers

### Authorization server
The Oracle Database

### Choosing an Authorization Grant flow
#### Authorization Code 
used with server-side Applications
#### Implicit
used with Mobile Apps or Web Applications (applications that run on the user's device)
#### Resource Owner Password Credentials
used with trusted Applications, such as those owned by the service itself
#### Client Credentials
used with Applications API access

## Creating a client

## openAPI specification

### Get the openAPI Metadata Catalog
https://oracle-base.com/articles/misc/oracle-rest-data-services-ords-open-api-swagger-support

### Get the openAPI documentation
http://editor.swagger.io/

### Generate client code
