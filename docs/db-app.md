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
```