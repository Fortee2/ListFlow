using System;
namespace ListFlow.OpenAI.Dto
{
	public class ChatMessage
	{
		public ChatMessage()
		{
		}

        public string role { get; set; }
        public string content { get; set; }
    }
}

