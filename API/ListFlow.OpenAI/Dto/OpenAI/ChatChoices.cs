using System;
namespace ListFlow.OpenAI.Dto
{
	public class ChatChoices
	{
		public ChatChoices()
		{
		}

        public ChatMessage message { get; set; }
        public string finish_reason { get; set; }
        public int index { get; set; }
    }
}

