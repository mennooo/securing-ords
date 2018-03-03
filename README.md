# securing-ords
How to secure a REST API build with Oracle REST Data Services (ORDS)

## Demo API
The demo that makes the most sence is securing a REST API for a B2B E-commerce application. B2B e-commerce, short for business-to-business, electronic commerce, is selling products or services between businesses through the internet via an online sales portal.

Oracle APEX is perfect because you can build database-driven applications using the web browser.

We are a an online store that sells clothes to customers.

For this demo we build our E-commerse application on top of a **Packaged App** in Oracle APEX: the **Sample Database Application**. This will be an Oracle Jet application because then it makes sence to use a REST API. The Oracle JET API provides the oj.OAuth authorization plugin which supports the OAuth 2.0 open protocol.

The goal is to create a REST API for the E-commerse application to let customers:
- Create an account
- Place new orders
- See products
- See order history

## Basic authentication


## Oauth2 protocol

### Resource owner
The E-commerse store

### Resource server
ORDS webserver

### Client
The customers

### Authorization server
The Oracle Database

### Choosing an Oauth Authorization Code Flow

## Creating a client

## openAPI specification

### Get the openAPI Metadata Catalog
https://oracle-base.com/articles/misc/oracle-rest-data-services-ords-open-api-swagger-support

### Get the openAPI documentation
http://editor.swagger.io/

### Generate client code
