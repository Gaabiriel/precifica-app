-- Reseta a personalização de widgets do dashboard pra voltar a usar o padrão
-- do sistema (null = padrão, conforme schema.sql). Precisa disso porque ela
-- já tinha uma lista de widgets salva de uma versão anterior do padrão.
update public.settings set dashboard_widgets = null where owner_id = '62f88a4b-a969-4f1a-8150-bfd21787abee';
