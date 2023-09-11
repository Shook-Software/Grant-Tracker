insert into [GrantTrackerDev].[GTkr].[FundingSource] (Abbreviation, Label, Description)

values 
('21st CCLC', '21st Century Community Learning Centers ', 'Funded by 21st CCLC'),
(NULL, 'Internal', 'Funded through another district-managed fund.'),
(NULL, 'External', 'Funded by a source outside of the district.')

select * from [GrantTrackerDev].[GTkr].[FundingSource]