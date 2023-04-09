using System;
using System.Text.Json;

namespace ListFlow.OpenAI.Dto
{
	public class ChatObject
	{
        private string _role;
        private string _message;

        public ChatObject(string role, string messageContent)
		{
			_role = role;
			_message = messageContent;
		}

		public string role { get { return _role; } set { _role = value; } }
		public string content { get { return _message; } set { _message = value; } }

        public static ChatObject Load(string role, string promptContent)
        {
            return new ChatObject(role,promptContent);
        }

        public string ToJson()
        {
            return JsonSerializer.Serialize(this);
        }
    }
}

