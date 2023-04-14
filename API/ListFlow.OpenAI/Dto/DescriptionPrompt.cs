using System;
using System.Text;
namespace ListFlow.OpenAI.Dto
{
	public class DescriptionPrompt
	{
		public DescriptionPrompt()
		{
		}

		public string description { get; set; }
		public string condition { get; set; }
		public string conditionDesc { get; set; }
		public string listingType { get; set; }
        public string intlShipping { get; set; }
        public string freeShipping { get; set; }

        public override string ToString()
        {
			StringBuilder sb = new StringBuilder();
			sb.AppendFormat("item to describe is  {0} \n.");
			sb.AppendFormat("It is in {0} condition. \n");
			
			if(conditionDesc != "")
			{
				sb.AppendFormat("More details about the condition details: {2} \n");
			}

			sb.AppendFormat("The type of listing the description is {0} an auction. \n", (listingType == "auction")	? "" : "not");

			sb.AppendFormat("International shipping is {0} available.", (listingType == "yes") ? "" : "not");
			sb.AppendFormat("Free shipping is {0} available.", (listingType == "yes") ? "" : "not");

			return sb.ToString();
        }
    }
}

