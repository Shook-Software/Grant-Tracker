insert into [GrantTrackerDev].[GTkr].[InstructorStatus] (Abbreviation, Label, Description)

values 
('AD',   'Administrator', 'Principal or site coordinator.'),
('SDT',  'School Day Teacher', 'Individual certified/qualified to work as a teacher in Arizona.'),
('ONT',  'Other Non-Teaching School Staff', 'Instructors whose primary role is to provide services or activities such as security, custodial, clerical, athletic, or transportation within the District.'),
('SSS',  'Subcontracted Staff', 'Vendors or ELI (retired teachers).'),
('P',    'Parent', 'Parent of 21st CCLC student.'),
('COLL', 'College Student', 'Individual currently enrolled in post-secondary institution.'),
('CM',   'Community Member', 'Individual from the community at-large.'),
('HSS',  'High School Student', 'Individual currently enrolled in a secondary institution.'),
(NULL,   'Other', 'Individual not identifiable with any category above.')

select * from [GrantTrackerDev].[GTkr].[InstructorStatus]