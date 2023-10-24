BEGIN TRANSACTION;
GO

ALTER TABLE [GTkr].[AttendanceRecord] DROP CONSTRAINT [FK_AttendanceRecord_Session_SessionGuid];
GO

ALTER TABLE [GTkr].[InstructorAttendanceRecord] DROP CONSTRAINT [FK_InstructorAttendanceRecord_AttendanceRecord_AttendanceRecordGuid];
GO

ALTER TABLE [GTkr].[InstructorAttendanceRecord] DROP CONSTRAINT [FK_InstructorAttendanceRecord_InstructorSchoolYear_InstructorSchoolYearGuid];
GO

ALTER TABLE [GTkr].[InstructorRegistration] DROP CONSTRAINT [FK_InstructorRegistration_InstructorSchoolYear_InstructorSchoolYearGuid];
GO

ALTER TABLE [GTkr].[InstructorRegistration] DROP CONSTRAINT [FK_InstructorRegistration_Session_SessionGuid];
GO

ALTER TABLE [GTkr].[InstructorSchoolYear] DROP CONSTRAINT [FK_InstructorSchoolYear_OrganizationYear_OrganizationYearGuid];
GO

ALTER TABLE [GTkr].[StudentAttendanceRecord] DROP CONSTRAINT [FK_StudentAttendanceRecord_AttendanceRecord_AttendanceRecordGuid];
GO

ALTER TABLE [GTkr].[StudentAttendanceRecord] DROP CONSTRAINT [FK_StudentAttendanceRecord_StudentSchoolYear_StudentSchoolYearGuid];
GO

ALTER TABLE [GTkr].[StudentRegistration] DROP CONSTRAINT [FK_StudentRegistration_StudentSchoolYear_StudentSchoolYearGuid];
GO

ALTER TABLE [GTkr].[InstructorAttendanceRecord] ADD [IsSubstitute] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [GTkr].[AttendanceRecord] ADD CONSTRAINT [FK_AttendanceRecord_Session_SessionGuid] FOREIGN KEY ([SessionGuid]) REFERENCES [GTkr].[Session] ([SessionGuid]) ON DELETE NO ACTION;
GO

ALTER TABLE [GTkr].[InstructorAttendanceRecord] ADD CONSTRAINT [FK_InstructorAttendanceRecord_AttendanceRecord_AttendanceRecordGuid] FOREIGN KEY ([AttendanceRecordGuid]) REFERENCES [GTkr].[AttendanceRecord] ([Guid]) ON DELETE CASCADE;
GO

ALTER TABLE [GTkr].[InstructorAttendanceRecord] ADD CONSTRAINT [FK_InstructorAttendanceRecord_InstructorSchoolYear_InstructorSchoolYearGuid] FOREIGN KEY ([InstructorSchoolYearGuid]) REFERENCES [GTkr].[InstructorSchoolYear] ([InstructorSchoolYearGuid]) ON DELETE CASCADE;
GO

ALTER TABLE [GTkr].[InstructorRegistration] ADD CONSTRAINT [FK_InstructorRegistration_InstructorSchoolYear_InstructorSchoolYearGuid] FOREIGN KEY ([InstructorSchoolYearGuid]) REFERENCES [GTkr].[InstructorSchoolYear] ([InstructorSchoolYearGuid]);
GO

ALTER TABLE [GTkr].[InstructorRegistration] ADD CONSTRAINT [FK_InstructorRegistration_Session_SessionGuid] FOREIGN KEY ([SessionGuid]) REFERENCES [GTkr].[Session] ([SessionGuid]) ON DELETE CASCADE;
GO

ALTER TABLE [GTkr].[InstructorSchoolYear] ADD CONSTRAINT [FK_InstructorSchoolYear_OrganizationYear_OrganizationYearGuid] FOREIGN KEY ([OrganizationYearGuid]) REFERENCES [GTkr].[OrganizationYear] ([OrganizationYearGuid]) ON DELETE CASCADE;
GO

ALTER TABLE [GTkr].[StudentAttendanceRecord] ADD CONSTRAINT [FK_StudentAttendanceRecord_AttendanceRecord_AttendanceRecordGuid] FOREIGN KEY ([AttendanceRecordGuid]) REFERENCES [GTkr].[AttendanceRecord] ([Guid]) ON DELETE CASCADE;
GO

ALTER TABLE [GTkr].[StudentAttendanceRecord] ADD CONSTRAINT [FK_StudentAttendanceRecord_StudentSchoolYear_StudentSchoolYearGuid] FOREIGN KEY ([StudentSchoolYearGuid]) REFERENCES [GTkr].[StudentSchoolYear] ([StudentSchoolYearGuid]) ON DELETE CASCADE;
GO

ALTER TABLE [GTkr].[StudentRegistration] ADD CONSTRAINT [FK_StudentRegistration_StudentSchoolYear_StudentSchoolYearGuid] FOREIGN KEY ([StudentSchoolYearGuid]) REFERENCES [GTkr].[StudentSchoolYear] ([StudentSchoolYearGuid]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20230916205108_CascadeAndSubstitute', N'7.0.11');
GO

COMMIT;
GO

