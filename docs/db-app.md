```sql
alter table demo_customers add (cust_password varchar2(2000));
alter table demo_customers add (facebook_id number);

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




exec OAUTH.DELETE_CLIENT('Fashion Store');
exec OAUTH.DELETE_CLIENT('Fashion Store (customers)');

begin
 
  oauth.create_client(
    p_name => 'Fashion Store',
    p_grant_type => 'client_credentials',
    p_owner => 'Example Inc.',
    p_description => 'Sample for demonstrating Client Credentials Flow',
    p_redirect_uri => 'http://example.org/auth/code/example/',
    p_support_email => 'support@example.org',
    p_support_uri => 'http://example.org/support',
    p_privilege_names => '' -- client_credentials don't need privileges
    );
  commit;
end;
/

begin 
 oauth.grant_client_role(
     'Fashion Store',
     'demo.api.application');
 commit;
end;
/

declare
  my_privs t_ords_vchar_tab  := t_ords_vchar_tab (); 
begin

  my_privs.EXTEND (2); 
  my_privs(1):='demo.api.account'; 
  my_privs(2):='demo.api.orders'; 
  
  oauth.create_client(
    p_name => 'Fashion Store (customers)',
    p_grant_type => 'authorization_code',
    p_owner => 'DEMO',
    p_description => 'Sample for demonstrating Client Credentials Flow',
    p_redirect_uri => 'http://localhost:3000/callback',
    p_support_email => 'support@example.org',
    p_support_uri => 'http://localhost:3000',
    p_privilege_names => 'demo.api.account' -- Currently not possible to add multiple privileges
    );
    
--  oauth.update_client(
--    p_name => 'Fashion Store (customers)'
--  , p_privilege_names => my_privs
--  );
  commit;
end;
/

begin 
 oauth.grant_client_role(
     'Fashion Store (customers)',
     'demo.api.customer');
 commit;
end;
/

begin
 
  oauth.create_client(
    p_name => 'Fashion Store (Customer client credentials)',
    p_grant_type => 'client_credentials',
    p_owner => 'DEMO',
    p_description => 'For accessing customer resources without grants',
    p_support_email => 'support@example.org',
    p_privilege_names => ''
    );
  commit;
end;
/

begin 
 oauth.grant_client_role(
     'Fashion Store (Customer client credentials)',
     'demo.api.customer');
 commit;
end;
/

select * from user_ords_clients;
select * from user_ords_client_privileges;

begin
  oauth.modify_approval_status(
    p_status      => 'PENDING',
    p_updated_by  => 'DEMO',

    p_approval_user => 'mennooo@hotmail.com',
    p_approval_id => 10779
  );
  commit;
end;
/
