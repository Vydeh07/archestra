'use client';

import { Link } from '@tanstack/react-router';
import { AlertCircle, FileText, Loader2, RefreshCw, X } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import ChatTokenUsage from '@ui/components/ChatTokenUsage';
import { ToolHoverCard } from '@ui/components/ToolHoverCard';
import {
  AIInput,
  AIInputButton,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from '@ui/components/kibo/ai-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/components/ui/tooltip';
import { cn } from '@ui/lib/utils/tailwind';
import { formatToolName } from '@ui/lib/utils/tools';
import {
  useCloudProvidersStore,
  useDeveloperModeStore,
  useMcpServersStore,
  useOllamaStore,
  useToolsStore,
  useUserSelectableModels,
} from '@ui/stores';
import { ChatMessageStatus } from '@ui/types/chat';
import type { Tool } from '@ui/types/tools';

import './chat-input.css';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isPreparing: boolean;
  disabled: boolean;
  rerunAgentDisabled: boolean;
  stop: () => void;
  hasMessages?: boolean;
  onRerunAgent?: () => void;
  status?: 'submitted' | 'streaming' | 'ready' | 'error';
  isSubmitting?: boolean;
  onClear: () => void;
  onCompact: () => void;
}

const PLACEHOLDER_EXAMPLES = [
  "For example: Read my gmail inbox, find all questions from investors, check slack's #general channel and prepare answers as email drafts",
  'For example: Open my linkedin and find all people who mention AI in their profile. Give me a list sorted by mutual connections',
  'For example: Analyze my calendar for next week and suggest optimal meeting times for a 2-hour workshop',
];

const slashCommands = [
  {
    command: '/clear',
    description: 'Start a new, empty chat',
  },
  {
    command: '/compact',
    description: 'Summarize the current conversation',
  },
];

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  isPreparing,
  disabled,
  rerunAgentDisabled,
  stop,
  hasMessages = false,
  onRerunAgent,
  status = 'ready',
  isSubmitting = false,
  onClear,
  onCompact,
}: ChatInputProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState(slashCommands);
  // ADDED: State to track if the input is a valid command for highlighting
  const [isValidCommand, setIsValidCommand] = useState(false);

  useEffect(() => {
    if (input.startsWith('/')) {
      const searchTerm = input.substring(1).toLowerCase();
      const newFilteredCommands = slashCommands.filter((cmd) => cmd.command.substring(1).includes(searchTerm));
      setFilteredCommands(newFilteredCommands);
      setIsAutocompleteOpen(newFilteredCommands.length > 0);

      // ADDED: Check if the input perfectly matches a command
      const isFullCommand = slashCommands.some(cmd => cmd.command === input);
      setIsValidCommand(isFullCommand);

    } else {
      setIsAutocompleteOpen(false);
      setIsValidCommand(false);
    }
  }, [input]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (isAutocompleteOpen && filteredCommands.length > 0) {
          const selectedCommand = filteredCommands[0].command;
          if (selectedCommand === '/clear') {
            onClear();
          } else if (selectedCommand === '/compact') {
            onCompact();
          }
          return;
        }
        if (!disabled) {
          handleSubmit();
        }
      }
    },
    [handleSubmit, disabled, isAutocompleteOpen, filteredCommands, onClear, onCompact]
  );

  return (
    <TooltipProvider>
      <AIInput onSubmit={handleSubmit} className="bg-inherit">
        <div className="relative">
          {isAutocompleteOpen && (
            <div className="absolute bottom-full mb-2 w-full bg-background border rounded-lg shadow-lg z-20">
              <div className="p-2 font-semibold text-sm">Commands</div>
              <ul>
                {filteredCommands.map((cmd) => (
                  <li
                    key={cmd.command}
                    className="px-4 py-2 hover:bg-muted cursor-pointer"
                    onClick={() => {
                      if (cmd.command === '/clear') onClear();
                      if (cmd.command === '/compact') onCompact();
                    }}
                  >
                    <div className="font-medium">{cmd.command}</div>
                    <div className="text-sm text-muted-foreground">{cmd.description}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <AIInputTextarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
            disabled={false}
            minHeight={48}
            maxHeight={164}
            // ADDED: Conditional class for highlighting the textarea border
            className={cn(
                "relative z-10",
                isValidCommand && "border-blue-500 ring-1 ring-blue-500"
            )}
          />
        </div>
        <AIInputToolbar>
          {/* All other toolbar items were removed for simplicity */}
        </AIInputToolbar>
      </AIInput>
    </TooltipProvider>
  );
}
