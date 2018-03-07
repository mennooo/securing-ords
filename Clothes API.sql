-- Generated by Oracle SQL Developer REST Data Services 17.4.0.355.2349
-- Exported REST Definitions from ORDS Schema Version 17.4.1.353.06.48
-- Schema: DEMO   Date: Wed Mar 07 23:29:07 CET 2018
--
BEGIN
  ORDS.ENABLE_SCHEMA(
      p_enabled             => TRUE,
      p_schema              => 'DEMO',
      p_url_mapping_type    => 'BASE_PATH',
      p_url_mapping_pattern => 'demo',
      p_auto_rest_auth      => FALSE);    

  ORDS.DEFINE_MODULE(
      p_module_name    => 'Clothes API',
      p_base_path      => '/api/',
      p_items_per_page =>  25,
      p_status         => 'PUBLISHED',
      p_comments       => NULL);      
  ORDS.DEFINE_TEMPLATE(
      p_module_name    => 'Clothes API',
      p_pattern        => 'customers',
      p_priority       => 0,
      p_etag_type      => 'HASH',
      p_etag_query     => NULL,
      p_comments       => NULL);
  ORDS.DEFINE_HANDLER(
      p_module_name    => 'Clothes API',
      p_pattern        => 'customers',
      p_method         => 'POST',
      p_source_type    => 'plsql/block',
      p_items_per_page =>  0,
      p_mimes_allowed  => '',
      p_comments       => NULL,
      p_source         => 
'declare

  l_id demo_customers.customer_id%type;

begin

  -- Insert new customer
  insert into demo_customers (
    cust_first_name
  , cust_last_name
  , cust_email
  , cust_password
  ) values (
    :first_name
  , :last_name
  , :email
  , :password
  ) returning customer_id into l_id;

  -- Give customer the role
  insert into demo_cust_roles (
    role_name
  , customer_id
  ) values (
    ''demo.api.consumer''
  , l_id
  );

  :location := l_id;
  :status := 201;

end;'
      );
  ORDS.DEFINE_PARAMETER(
      p_module_name        => 'Clothes API',
      p_pattern            => 'customers',
      p_method             => 'POST',
      p_name               => 'location',
      p_bind_variable_name => 'location',
      p_source_type        => 'RESPONSE',
      p_param_type         => 'INT',
      p_access_method      => 'OUT',
      p_comments           => NULL);      
  ORDS.DEFINE_PARAMETER(
      p_module_name        => 'Clothes API',
      p_pattern            => 'customers',
      p_method             => 'POST',
      p_name               => 'status',
      p_bind_variable_name => 'status',
      p_source_type        => 'RESPONSE',
      p_param_type         => 'INT',
      p_access_method      => 'OUT',
      p_comments           => NULL);      
  ORDS.DEFINE_TEMPLATE(
      p_module_name    => 'Clothes API',
      p_pattern        => 'customers/{id}',
      p_priority       => 0,
      p_etag_type      => 'HASH',
      p_etag_query     => NULL,
      p_comments       => NULL);
  ORDS.DEFINE_TEMPLATE(
      p_module_name    => 'Clothes API',
      p_pattern        => 'orders',
      p_priority       => 0,
      p_etag_type      => 'HASH',
      p_etag_query     => NULL,
      p_comments       => NULL);
  ORDS.DEFINE_HANDLER(
      p_module_name    => 'Clothes API',
      p_pattern        => 'orders',
      p_method         => 'POST',
      p_source_type    => 'plsql/block',
      p_items_per_page =>  0,
      p_mimes_allowed  => '',
      p_comments       => NULL,
      p_source         => 
'declare

  l_id                  demo_orders.order_id%type;
  l_customer_id         demo_customers.customer_id%type;
  l_product_list_price  number;

begin

  select customer_id into l_customer_id
    from demo_customers
   where cust_email = :current_user;

  select list_price into l_product_list_price
    from demo_product_info
   where product_id = :product_id;

  -- Insert order
  insert into demo_orders (
    customer_id
  , order_total
  , order_timestamp
  , user_name
  ) values (
    l_customer_id
  , :quantity * l_product_list_price
  , systimestamp
  , sys_context(''userenv'', ''current_user'')
  ) returning order_id into l_id;

  -- Inser order line(s)
  insert into demo_order_items (
    order_id
  , product_id
  , unit_price
  , quantity
  ) values (
    l_id
  , :product_id
  , l_product_list_price
  , :quantity
  );

  :location := l_id;
  :status := 201;

end;'
      );
  ORDS.DEFINE_HANDLER(
      p_module_name    => 'Clothes API',
      p_pattern        => 'orders',
      p_method         => 'GET',
      p_source_type    => 'json/collection',
      p_items_per_page =>  25,
      p_mimes_allowed  => '',
      p_comments       => NULL,
      p_source         => 
'select ordr.order_id
     , prod.product_name
     , to_char(ordr.order_timestamp, ''DD-MM-RRRR HH24:MI'') order_date
     , ordi.quantity
     , ordi.unit_price * ordi.quantity price
  from demo_orders ordr
  join demo_order_items ordi
    on ordi.order_id = ordr.order_id
  join demo_product_info prod
    on ordi.product_id = prod.product_id
  join demo_customers cust
    on ordr.customer_id = cust.customer_id
 where cust.cust_email = :current_user
 order by ordr.order_timestamp desc'
      );
  ORDS.DEFINE_TEMPLATE(
      p_module_name    => 'Clothes API',
      p_pattern        => 'products',
      p_priority       => 0,
      p_etag_type      => 'HASH',
      p_etag_query     => NULL,
      p_comments       => NULL);
  ORDS.DEFINE_HANDLER(
      p_module_name    => 'Clothes API',
      p_pattern        => 'products',
      p_method         => 'GET',
      p_source_type    => 'json/collection',
      p_items_per_page =>  25,
      p_mimes_allowed  => '',
      p_comments       => NULL,
      p_source         => 
'select *
  from demo_product_info'
      );
  ORDS.DEFINE_TEMPLATE(
      p_module_name    => 'Clothes API',
      p_pattern        => 'products/{id}',
      p_priority       => 0,
      p_etag_type      => 'HASH',
      p_etag_query     => NULL,
      p_comments       => NULL);
  ORDS.DEFINE_HANDLER(
      p_module_name    => 'Clothes API',
      p_pattern        => 'products/{id}',
      p_method         => 'GET',
      p_source_type    => 'json/item',
      p_items_per_page =>  25,
      p_mimes_allowed  => '',
      p_comments       => NULL,
      p_source         => 
'select *
  from demo_product_info
 where product_id = :id'
      );


  COMMIT; 
END;