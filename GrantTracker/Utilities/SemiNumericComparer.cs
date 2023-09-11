using System.Globalization;

namespace GrantTracker.Utilities
{
	public class SemiNumericComparer : IComparer<string>
	{
		/// <summary>
		/// Method to determine if a string is a number
		/// </summary>
		/// <param name="value">String to test</param>
		/// <returns>True if numeric</returns>
		public static bool IsNumeric(string value)
		{
			return int.TryParse(value, out _);
		}

		/// <inheritdoc />
		public int Compare(string s1, string s2)
		{
			const int S1GreaterThanS2 = 1;
			const int S2GreaterThanS1 = -1;

			var oneIsNumeric = IsNumeric(s1);
			var twoIsNumeric = IsNumeric(s2);

			if (oneIsNumeric && twoIsNumeric)
			{
				var i1 = Convert.ToInt32(s1);
				var i2 = Convert.ToInt32(s2);

				if (i1 > i2)
				{
					return S1GreaterThanS2;
				}
				if (i1 < i2)
				{
					return S2GreaterThanS1;
				}

				return 0;
			}
			//These are flipped from what might be expected
			if (oneIsNumeric)
			{
				return S1GreaterThanS2;
			}

			if (twoIsNumeric)
			{
				return S2GreaterThanS1;
			}

			return string.Compare(s1, s2, true, CultureInfo.InvariantCulture);
		}
	}
}
