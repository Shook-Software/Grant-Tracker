using GrantTracker.Dal.Models.Views;
using GrantTracker.Dal.Repositories.StudentRepository;

namespace GrantTracker.Dal.Models.Dto
{
	public class StudentDto
	{
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string MatricNumber { get; set; }
		public string Grade { get; set; }

		public async Task<StudentSchoolYearWithRecordsView> EnsureStudentExistsAsync(IStudentRepository studentRepository, StudentRegistrationDto newRegistration)
		{
			var studentSchoolYear = await studentRepository.GetSingleAsync(newRegistration.Student.MatricNumber);

			//if they don't exist, add them
			if (studentSchoolYear is null)
			{
				StudentDto newStudent = new()
				{
					FirstName = newRegistration.Student.FirstName,
					LastName = newRegistration.Student.LastName,
					MatricNumber = newRegistration.Student.MatricNumber,
					Grade = newRegistration.Student.Grade
				};

				await studentRepository.AddAsync(newStudent);
				return await studentRepository.GetSingleAsync(newStudent.MatricNumber);
			}

			return studentSchoolYear;
		}
	}
}