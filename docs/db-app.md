```sql
alter table demo_customers add (cust_password varchar2(2000));

create table demo_cust_roles (
  role_name varchar2(200) not null
, customer_id number not null
, constraint cust_role_cust_fk
    foreign key (customer_id)
    references demo_customers (customer_id)
);

create or replace view vw_users as
select cust_email
     , cust_password
  from demo_customers;

create or replace view vw_roles as
select cust.cust_email
     , role.role_name
  from demo_customers cust
  join demo_cust_roles role
    on role.customer_id = cust.customer_id;



create table applications (app_name varchar2(50), app_username varchar2(50), app_password varchar2(2000));

insert into applications (app_name, app_username, app_password) values ('Fashion store', 'fashion', '309d267f086d5fe5433d5bcc11cf83c14ffb5518dca95fc59b17363bb421e28e');

create table application_roles (app_name varchar2(50), role_name varchar2(255));

insert into application_roles(app_name, role_name) values ('fashion', 'demo.api.all');

create or replace view vw_users as
select cust_email
     , cust_password
  from demo_customers
 union
select app_username
     , app_password
 from applications;

create or replace view vw_roles as
select cust.cust_email
     , role.role_name
  from demo_customers cust
  join demo_cust_roles role
    on role.customer_id = cust.customer_id
 union
select app_name
     , role_name
  from application_roles;
```

http://localhost:8080/ords/demo/oauth/auth?response_type=code&client_id=zQfSbx3bXRkC1ke4yrP9fA...&state=aa
http://localhost:8080/ords/demo/oauth/auth?client_id=-SujDXDkATsfWO6_tezY5Q..&response_type=code&state=aa