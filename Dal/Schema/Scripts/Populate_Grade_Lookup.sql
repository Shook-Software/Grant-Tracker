
-delete 
from [GrantTrackerDev].[GTkr].[LookupDefinition] 
where Name = 'Grade';

insert into [GrantTrackerDev].[GTkr].[LookupDefinition] (Name, Description)
values ('Grade', 'Class grades, from kindergarten to twelfth.');

declare @defGuid varchar(50);

select top 1 @defGuid=Guid
from [GrantTrackerDev].[GTkr].[LookupDefinition] def
where def.Name = 'Grade';

insert into [GrantTrackerDev].[GTkr].[LookupValue] (DefinitionGuid, Value, Description)
values 
(@defGuid, 'KG', 'Kindergarten'),
(@defGuid, '01', '1st Grade'),
(@defGuid, '02', '2nd Grade'),
(@defGuid, '03', '3rd Grade'),
(@defGuid, '04', '4th Grade'),
(@defGuid, '05', '5th Grade'),
(@defGuid, '06', '6th Grade'),
(@defGuid, '07', '7th Grade'),
(@defGuid, '08', '8th Grade'),
(@defGuid, '09', '9th Grade'),
(@defGuid, '10', '10th Grade'),
(@defGuid, '11', '11th Grade'),
(@defGuid, '12', '12th Grade');


