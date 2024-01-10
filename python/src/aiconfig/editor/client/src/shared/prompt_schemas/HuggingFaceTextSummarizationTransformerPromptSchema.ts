import { PromptSchema } from "../../utils/promptUtils";
import { HuggingFaceTextGenerationTransformerPromptSchema } from "./HuggingFaceTextGenerationTransformerPromptSchema";

export const HuggingFaceTextSummarizationTransformerPromptSchema: PromptSchema =
  {
    ...HuggingFaceTextGenerationTransformerPromptSchema,
  };
