using System;
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


        public override string ToString()
        {
			return String.Format("item: {0} \n condition: {1} \n condition details: {2} \n listing type: {3}", description, condition, conditionDesc, listingType);
        }
    }
}

