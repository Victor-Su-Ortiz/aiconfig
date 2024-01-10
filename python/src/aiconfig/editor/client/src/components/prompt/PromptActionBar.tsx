import ModelSettingsRenderer from "./model_settings/ModelSettingsRenderer";
import PromptMetadataRenderer from "./prompt_metadata/PromptMetadataRenderer";
import { ClientPrompt } from "../../shared/types";
import {
  PromptSchema,
  checkParametersSupported,
} from "../../utils/promptUtils";
import { ActionIcon, Container, Flex, Tabs } from "@mantine/core";
import { IconClearAll } from "@tabler/icons-react";
import { memo, useCallback, useState } from "react";
import ParametersRenderer from "../ParametersRenderer";
import RunPromptButton from "./RunPromptButton";
import { JSONObject } from "aiconfig";

type Props = {
  prompt: ClientPrompt;
  promptSchema?: PromptSchema;
  cancel: (cancellationToken: string) => Promise<void>;
  onRunPrompt: () => Promise<void>;
  onUpdateModelSettings: (settings: Record<string, unknown>) => void;
  onUpdateParameters: (parameters: JSONObject) => void;
};

// Don't default to config-level model settings since that could be confusing
// to have them shown at the prompt level in the editor but not in the config
function getModelSettings(prompt: ClientPrompt) {
  if (typeof prompt.metadata?.model !== "string") {
    return prompt.metadata?.model?.settings;
  }
}

function getPromptParameters(prompt: ClientPrompt) {
  return prompt.metadata?.parameters;
}

export default memo(function PromptActionBar({
  prompt,
  promptSchema,
  cancel,
  onRunPrompt,
  onUpdateModelSettings,
  onUpdateParameters,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  // TODO: Handle drag-to-resize
  const modelSettingsSchema = promptSchema?.model_settings;
  const promptMetadataSchema = promptSchema?.prompt_metadata;

  const onCancel = useCallback(async () => {
    if (prompt._ui.cancellationToken) {
      return await cancel(prompt._ui.cancellationToken);
    } else {
      // TODO: saqadri - Maybe surface an error to the user, or explicitly throw an error in this case.
      console.log(
        `Warning: No cancellation token found for prompt: ${prompt.name}`
      );
      return;
    }
  }, [prompt.name, prompt._ui.cancellationToken, cancel]);

  return (
    <Flex direction="column" justify="space-between" h="100%">
      {isExpanded ? (
        <>
          <Container miw="400px">
            <ActionIcon
              size="sm"
              onClick={() => setIsExpanded(false)}
              mt="0.5em"
            >
              <IconClearAll />
            </ActionIcon>
            <Tabs defaultValue="settings" mb="1em">
              <Tabs.List>
                <Tabs.Tab value="settings">Settings</Tabs.Tab>
                {checkParametersSupported(prompt) && (
                  <Tabs.Tab value="parameters">
                    Local Variables (Parameters)
                  </Tabs.Tab>
                )}
              </Tabs.List>

              <Tabs.Panel value="settings" className="actionTabsPanel">
                <ModelSettingsRenderer
                  settings={getModelSettings(prompt)}
                  schema={modelSettingsSchema}
                  onUpdateModelSettings={onUpdateModelSettings}
                />
                <PromptMetadataRenderer
                  prompt={prompt}
                  schema={promptMetadataSchema}
                />
              </Tabs.Panel>

              {checkParametersSupported(prompt) && (
                <Tabs.Panel value="parameters" className="actionTabsPanel">
                  <ParametersRenderer
                    initialValue={getPromptParameters(prompt)}
                    onUpdateParameters={onUpdateParameters}
                  />
                </Tabs.Panel>
              )}
            </Tabs>
          </Container>
          <RunPromptButton
            isRunning={prompt._ui.isRunning}
            cancel={onCancel}
            runPrompt={onRunPrompt}
            size="full"
          />
        </>
      ) : (
        <Flex direction="column" justify="space-between" h="100%">
          <Flex direction="row" justify="center" mt="0.5em">
            <ActionIcon size="sm" onClick={() => setIsExpanded(true)}>
              <IconClearAll />
            </ActionIcon>
          </Flex>
          <RunPromptButton
            isRunning={prompt._ui.isRunning}
            cancel={onCancel}
            runPrompt={onRunPrompt}
            size="compact"
          />
        </Flex>
      )}
    </Flex>
  );
});
