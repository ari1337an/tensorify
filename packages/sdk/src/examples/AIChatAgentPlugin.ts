/**
 * SAMPLE PLUGIN: AI Chat Agent with Tools
 * This plugin demonstrates ALL the frontend requirements from the specification
 *
 * This is a complete, working example showing:
 * - All handle types and positions
 * - All settings field types
 * - Visual configuration with icons
 * - Dynamic label templates
 * - Comprehensive code generation
 * - Custom validation
 */

import {
  TensorifyPlugin,
  IPluginDefinition,
  PluginSettings,
  PluginCodeGenerationContext,
  HandleViewType,
  NodeViewContainerType,
  SettingsFieldType,
  IconType,
  HandlePosition,
  EdgeType,
} from "../index";

export class AIChatAgentPlugin extends TensorifyPlugin {
  constructor() {
    super({
      // Basic plugin metadata
      id: "ai-chat-agent-tools",
      name: "AI Chat Agent",
      description:
        "An intelligent chat agent that can use external tools and maintain conversation memory",
      version: "1.2.0",
      category: "ai",

      // VISUAL CONFIGURATION - Matches PDF requirements
      visual: {
        // Container type - using "box" for the AI Agent style
        containerType: "box" as NodeViewContainerType,

        // Dynamic sizing - AI Agent is wider than square nodes
        size: {
          width: 280, // Wider than standard nodes
          height: 180, // Taller to accommodate multiple handles
          minWidth: 250, // Minimum size constraints
          minHeight: 150,
        },

        // Extra padding - like the "Failure" node in specification
        extraPadding: true,

        // Main title and description shown on node
        title: "AI Agent",
        titleDescription: "Tools Agent",

        // PRIMARY ICON - Center icon using FontAwesome
        primaryIcon: {
          type: "fontawesome" as IconType,
          value: "fa:robot", // Robot icon for AI agent
          position: "center",
        },

        // SECONDARY ICONS - Positioned icons like lightning bolt in specification
        secondaryIcons: [
          {
            type: "lucide" as IconType,
            value: "zap", // Lightning bolt icon
            position: "left", // Positioned on the left like in specification
          },
          {
            type: "lucide" as IconType,
            value: "brain", // Brain icon for AI
            position: "top", // Additional icon on top
          },
        ],

        // DYNAMIC LABEL - Changes based on settings (like "When chat message received")
        dynamicLabelTemplate: "Using {model} with {toolCount} tools",
      },

      // INPUT HANDLES - Demonstrating all handle types and requirements
      inputHandles: [
        {
          id: "memory-input",
          position: "top" as HandlePosition,
          viewType: "verticalBox" as HandleViewType, // Vertical box handle
          required: false, // Optional - no red star
          label: "Memory",
          edgeType: "muted" as EdgeType, // Muted edge styling
        },
        {
          id: "tools-input",
          position: "top-right" as HandlePosition,
          viewType: "circle-lg" as HandleViewType, // Large circle handle
          required: false, // Optional - no red star
          label: "Tools",
          edgeType: "dotted" as EdgeType, // Dotted edge styling
        },
        {
          id: "chat-model-input",
          position: "left" as HandlePosition,
          viewType: "default" as HandleViewType, // Standard handle
          required: true, // Required - shows red star (*)
          label: "Chat Model",
          edgeType: "accent" as EdgeType, // Accent edge styling
        },
        {
          id: "context-input",
          position: "bottom-left" as HandlePosition,
          viewType: "diamond" as HandleViewType, // Diamond handle
          required: false,
          label: "Context",
          edgeType: "solid" as EdgeType,
        },
      ],

      // OUTPUT HANDLES - Multiple outputs for different data flows
      outputHandles: [
        {
          id: "response-output",
          position: "right" as HandlePosition,
          viewType: "default" as HandleViewType,
          label: "Response",
          edgeType: "accent" as EdgeType,
        },
        {
          id: "tool-calls-output",
          position: "bottom-right" as HandlePosition,
          viewType: "circle-lg" as HandleViewType,
          label: "Tool Calls",
          edgeType: "solid" as EdgeType,
        },
      ],

      // SETTINGS FIELDS - All UI component types from specification
      settingsFields: [
        {
          // DROPDOWN - For model selection
          key: "model",
          label: "AI Model",
          type: "dropdown" as SettingsFieldType,
          dataType: "string",
          defaultValue: "gpt-4",
          required: true,
          description: "Select the AI model to use for chat responses",
          options: [
            { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
            { label: "GPT-4", value: "gpt-4" },
            { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
            { label: "Claude-3 Sonnet", value: "claude-3-sonnet" },
          ],
        },
        {
          // TEXTAREA - For system prompt
          key: "systemPrompt",
          label: "System Prompt",
          type: "textarea" as SettingsFieldType,
          dataType: "string",
          defaultValue:
            "You are a helpful AI assistant with access to external tools.",
          required: false,
          description: "Define the AI's behavior and personality",
        },
        {
          // INPUT-TEXT - For simple string input
          key: "agentName",
          label: "Agent Name",
          type: "input-text" as SettingsFieldType,
          dataType: "string",
          defaultValue: "Assistant",
          required: false,
          description: "Custom name for the AI agent",
        },
        {
          // INPUT-NUMBER - For numeric values
          key: "temperature",
          label: "Temperature",
          type: "input-number" as SettingsFieldType,
          dataType: "number",
          defaultValue: 0.7,
          required: false,
          description: "Controls randomness in responses (0.0 - 2.0)",
        },
        {
          // INPUT-NUMBER - For tool count (affects dynamic label)
          key: "toolCount",
          label: "Max Tools",
          type: "input-number" as SettingsFieldType,
          dataType: "number",
          defaultValue: 5,
          required: false,
          description: "Maximum number of tools the agent can use",
        },
        {
          // TOGGLE - For boolean settings
          key: "enableStreaming",
          label: "Enable Streaming",
          type: "toggle" as SettingsFieldType,
          dataType: "boolean",
          defaultValue: true,
          required: false,
          description: "Stream responses in real-time",
        },
        {
          // CHECKBOX - Alternative boolean input
          key: "saveConversation",
          label: "Save Conversation History",
          type: "checkbox" as SettingsFieldType,
          dataType: "boolean",
          defaultValue: false,
          required: false,
          description: "Persist conversation for future sessions",
        },
        {
          // RADIO - For exclusive selection
          key: "responseFormat",
          label: "Response Format",
          type: "radio" as SettingsFieldType,
          dataType: "string",
          defaultValue: "markdown",
          required: true,
          description: "Choose how responses are formatted",
          options: [
            { label: "Plain Text", value: "text" },
            { label: "Markdown", value: "markdown" },
            { label: "HTML", value: "html" },
            { label: "JSON", value: "json" },
          ],
        },
      ],
    });

    // Set dynamic label template after construction
    // This will become "Using gpt-4 with 5 tools" based on settings
    this.updateDynamicLabel("Using {model} with {toolCount} tools");
  }

  /**
   * CODE GENERATION METHOD
   * This generates the actual executable code for the plugin
   * Frontend will call this with current settings values
   */
  public getTranslationCode(
    settings: PluginSettings,
    children?: any,
    context?: PluginCodeGenerationContext
  ): string {
    // Validate settings first (inherited from TensorifyPlugin)
    this.validateSettings(settings);

    // Generate Python code for AI chat agent
    const generatedCode = `
# Generated AI Chat Agent Code
import openai
import json
from typing import List, Dict, Any, Optional

class AIChatAgent:
    """
    AI Chat Agent with tool integration
    Generated from Tensorify plugin configuration
    """
    
    def __init__(self):
        # Configuration from plugin settings
        self.model = "${settings.model || "gpt-4"}"
        self.agent_name = "${settings.agentName || "Assistant"}"
        self.temperature = ${settings.temperature || 0.7}
        self.max_tools = ${settings.toolCount || 5}
        self.enable_streaming = ${settings.enableStreaming || true}
        self.save_conversation = ${settings.saveConversation || false}
        self.response_format = "${settings.responseFormat || "markdown"}"
        
        # System prompt configuration
        self.system_prompt = """${settings.systemPrompt || "You are a helpful AI assistant with access to external tools."}"""
        
        # Initialize conversation history
        self.conversation_history = []
        self.available_tools = []
        
        print(f"🤖 {self.agent_name} initialized with {self.model}")
        print(f"📊 Temperature: {self.temperature}, Max Tools: {self.max_tools}")
        print(f"🔄 Streaming: {self.enable_streaming}, Save: {self.save_conversation}")

    def add_tool(self, tool_definition: Dict[str, Any]) -> None:
        """Add a tool to the agent's available tools"""
        if len(self.available_tools) < self.max_tools:
            self.available_tools.append(tool_definition)
            print(f"🔧 Added tool: {tool_definition.get('name', 'Unknown')}")
        else:
            print(f"⚠️ Tool limit reached ({self.max_tools}), cannot add more tools")

    def process_message(self, 
                       message: str, 
                       memory_context: Optional[Dict] = None,
                       tools_context: Optional[List] = None,
                       chat_model_context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Process incoming chat message with context from connected nodes
        
        Args:
            message: User's chat message
            memory_context: Context from memory input handle  
            tools_context: Available tools from tools input handle
            chat_model_context: Chat model configuration from required input
        """
        
        # Validate required inputs
        if not chat_model_context:
            raise ValueError("Chat Model input is required (marked with * in UI)")
        
        # Merge tools from context if provided
        if tools_context:
            for tool in tools_context[:self.max_tools]:
                if tool not in self.available_tools:
                    self.available_tools.append(tool)
        
        # Prepare conversation context
        conversation = []
        if memory_context and memory_context.get('history'):
            conversation.extend(memory_context['history'])
        
        # Add system prompt
        conversation.append({
            "role": "system", 
            "content": self.system_prompt
        })
        
        # Add user message
        conversation.append({
            "role": "user",
            "content": message
        })
        
        # Generate response based on settings
        response_data = self._generate_response(conversation)
        
        # Save conversation if enabled
        if self.save_conversation:
            self.conversation_history.extend([
                {"role": "user", "content": message},
                {"role": "assistant", "content": response_data['content']}
            ])
        
        return {
            "response": self._format_response(response_data['content']),
            "tool_calls": response_data.get('tool_calls', []),
            "metadata": {
                "model_used": self.model,
                "temperature": self.temperature,
                "tools_available": len(self.available_tools),
                "streaming_enabled": self.enable_streaming
            }
        }

    def _generate_response(self, conversation: List[Dict]) -> Dict[str, Any]:
        """Generate AI response using configured model"""
        # This would integrate with actual AI model APIs
        # For demo purposes, returning structured response
        
        response = {
            "content": f"Response from {self.model} (temp: {self.temperature})",
            "tool_calls": []
        }
        
        # Simulate tool usage if tools are available
        if self.available_tools:
            response["tool_calls"] = [
                {
                    "tool": tool.get("name", "unknown"),
                    "called": True
                } for tool in self.available_tools[:2]  # Use first 2 tools
            ]
        
        return response

    def _format_response(self, content: str) -> str:
        """Format response according to selected format"""
        if self.response_format == "markdown":
            return f"**{self.agent_name}:** {content}"
        elif self.response_format == "html":
            return f"<strong>{self.agent_name}:</strong> {content}"
        elif self.response_format == "json":
            return json.dumps({"agent": self.agent_name, "message": content})
        else:  # text
            return f"{self.agent_name}: {content}"

    def get_status(self) -> Dict[str, Any]:
        """Get current agent status"""
        return {
            "agent_name": self.agent_name,
            "model": self.model,
            "tools_loaded": len(self.available_tools),
            "conversations_saved": len(self.conversation_history),
            "configuration": {
                "temperature": self.temperature,
                "streaming": self.enable_streaming,
                "format": self.response_format
            }
        }

# Create agent instance
agent = AIChatAgent()

# Example usage:
# result = agent.process_message(
#     "Hello, can you help me analyze some data?",
#     memory_context={"history": []},
#     tools_context=[{"name": "data_analyzer", "type": "analysis"}],
#     chat_model_context={"model": "${settings.model}"}
# )
# print(result)
    `.trim();

    return generatedCode;
  }

  /**
   * CUSTOM VALIDATION FOR THIS PLUGIN
   * Override base validation to add plugin-specific rules
   */
  public validateSettings(settings: PluginSettings): boolean {
    // Call parent validation first
    super.validateSettings(settings);

    // Custom validation for temperature range
    if (
      settings.temperature !== undefined &&
      (settings.temperature < 0 || settings.temperature > 2)
    ) {
      throw new Error("Temperature must be between 0.0 and 2.0");
    }

    // Custom validation for tool count
    if (settings.toolCount !== undefined && settings.toolCount < 0) {
      throw new Error("Tool count cannot be negative");
    }

    // Validate model selection
    const validModels = [
      "gpt-4-turbo",
      "gpt-4",
      "gpt-3.5-turbo",
      "claude-3-sonnet",
    ];
    if (settings.model && !validModels.includes(settings.model)) {
      throw new Error(
        `Invalid model: ${settings.model}. Must be one of: ${validModels.join(", ")}`
      );
    }

    return true;
  }

  /**
   * Enhanced capabilities for this specific plugin
   */
  protected getCapabilities(): string[] {
    const baseCaps = super.getCapabilities();
    return [
      ...baseCaps,
      "ai-chat",
      "tool-integration",
      "conversation-memory",
      "streaming-responses",
      "multi-format-output",
    ];
  }
}

/**
 * Export the plugin class - this is what gets imported by the plugin system
 */
export default AIChatAgentPlugin;

/**
 * EXAMPLE GENERATED MANIFEST.JSON
 * This is what the frontend will consume to render the React Flow node
 */
/*
{
  "name": "@tensorify/ai-chat-agent-tools",
  "version": "1.2.0", 
  "description": "An intelligent chat agent that can use external tools and maintain conversation memory",
  "author": "Tensorify Developer <support@tensorify.io>",
  "main": "dist/index.js",
  "entrypointClassName": "AIChatAgentPlugin",
  "keywords": ["tensorify", "plugin", "ai", "chat", "agent", "tools"],
  "frontendConfigs": {
    "id": "ai-chat-agent-tools",
    "name": "AI Chat Agent", 
    "category": "ai",
    "title": "AI Agent",
    "titleDescription": "Tools Agent",
    "containerType": "box",
    "size": { "width": 280, "height": 180, "minWidth": 250, "minHeight": 150 },
    "extraPadding": true,
    "primaryIcon": { "type": "fontawesome", "value": "fa:robot", "position": "center" },
    "secondaryIcons": [
      { "type": "lucide", "value": "zap", "position": "left" },
      { "type": "lucide", "value": "brain", "position": "top" }
    ],
    "inputHandles": [
      { "id": "memory-input", "position": "top", "viewType": "verticalBox", "required": false, "label": "Memory", "edgeType": "muted" },
      { "id": "tools-input", "position": "top-right", "viewType": "circle-lg", "required": false, "label": "Tools", "edgeType": "dotted" },
      { "id": "chat-model-input", "position": "left", "viewType": "default", "required": true, "label": "Chat Model", "edgeType": "accent" },
      { "id": "context-input", "position": "bottom-left", "viewType": "diamond", "required": false, "label": "Context", "edgeType": "solid" }
    ],
    "outputHandles": [
      { "id": "response-output", "position": "right", "viewType": "default", "label": "Response", "edgeType": "accent" },
      { "id": "tool-calls-output", "position": "bottom-right", "viewType": "circle-lg", "label": "Tool Calls", "edgeType": "solid" }
    ],
    "settingsFields": [
      { "key": "model", "label": "AI Model", "type": "dropdown", "dataType": "string", "defaultValue": "gpt-4", "required": true, "options": [...] },
      { "key": "systemPrompt", "label": "System Prompt", "type": "textarea", "dataType": "string", "defaultValue": "You are a helpful AI assistant...", "required": false },
      { "key": "agentName", "label": "Agent Name", "type": "input-text", "dataType": "string", "defaultValue": "Assistant", "required": false },
      { "key": "temperature", "label": "Temperature", "type": "input-number", "dataType": "number", "defaultValue": 0.7, "required": false },
      { "key": "toolCount", "label": "Max Tools", "type": "input-number", "dataType": "number", "defaultValue": 5, "required": false },
      { "key": "enableStreaming", "label": "Enable Streaming", "type": "toggle", "dataType": "boolean", "defaultValue": true, "required": false },
      { "key": "saveConversation", "label": "Save Conversation History", "type": "checkbox", "dataType": "boolean", "defaultValue": false, "required": false },
      { "key": "responseFormat", "label": "Response Format", "type": "radio", "dataType": "string", "defaultValue": "markdown", "required": true, "options": [...] }
    ],
    "dynamicLabelTemplate": "Using {model} with {toolCount} tools"
  },
  "capabilities": [
    "code-generation",
    "input-handling", 
    "output-handling",
    "configurable",
    "dynamic-labeling",
    "ai-chat",
    "tool-integration",
    "conversation-memory",
    "streaming-responses",
    "multi-format-output"
  ],
  "requirements": {
    "minSdkVersion": "1.0.0",
    "dependencies": []
  }
}
*/
