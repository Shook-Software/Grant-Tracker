namespace GrantTracker.Dal.Models.DTO
{
	public static class GradeDto
	{
		public static string FromSynergy(string grade) =>
		grade switch
		{
			"080" => "PS",
			"100" => "KG",
			"110" => "01",
			"120" => "02",
			"130" => "03",
			"140" => "04",
			"150" => "05",
			"160" => "06",
			"170" => "07",
			"180" => "08",
			"190" => "09",
			"200" => "10",
			"210" => "11",
			"220" => "12",
			_ => grade
		};

		public static string ToSynergy(string grade) =>
			grade switch
			{
				"PS" => "080",
				"KG" => "100",
				"01" => "110",
				"02" => "120",
				"03" => "130",
				"04" => "140",
				"05" => "150",
				"06" => "160",
				"07" => "170",
				"08" => "180",
				"09" => "190",
				"10" => "200",
				"11" => "210",
				"12" => "220",
				_ => null
			};
	}
}