begin

  ORDS.DELETE_MODULE('Demo API');

  ORDS.DELETE_PRIVILEGE('demo.api.account');
  ORDS.DELETE_PRIVILEGE('demo.api.customers');
  ORDS.DELETE_PRIVILEGE('demo.api.products');
  
  ORDS.DELETE_ROLE('demo.api.application');
  ORDS.DELETE_ROLE('demo.api.customer');

  commit;
end;
/