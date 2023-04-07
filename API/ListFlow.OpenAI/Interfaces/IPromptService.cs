using System;
using ListFlow.OpenAI.Dto;

namespace ListFlow.OpenAI.Interfaces
{
	public interface IPromptService
	{
        Task<ChatCompletion> Submit(string PromptData);

    }
}

