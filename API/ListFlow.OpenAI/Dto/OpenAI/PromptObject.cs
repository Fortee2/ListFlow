using System;
using System.Text.Json;

namespace ListFlow.OpenAI.Dto
{
	public class PromptObject
	{
		private string _aiModel;
		private ChatObject[] _prompt;

        public PromptObject(ChatObject[] PromptText, string AIModel = "text-davinci-003")
		{
			_aiModel = AIModel;
			_prompt = PromptText;
		}

		public string model { get{ return _aiModel; } set { _aiModel = value; } }
		public ChatObject[] messages { get { return _prompt; } set { _prompt = value; } }

		public static PromptObject Load(ChatObject[] AIPrompt)
		{
			return new PromptObject(AIPrompt, "gpt-3.5-turbo");
		}

		public string ToJson()
		{
			return JsonSerializer.Serialize(this);
		}
	}
}

