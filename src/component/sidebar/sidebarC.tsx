'use client';

import { Avatar, Button, DropdownMenu, Strong } from '@radix-ui/themes';

export const UserPlaceholder = () => {
  return (
    <div className="flex items-center gap-4">
      <Avatar variant="soft" fallback="장" />
      <div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button
              color="gray"
              variant="soft"
              size="3"
              className="!bg-transparent"
            >
              장우성
              <DropdownMenu.TriggerIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            color="gray"
            variant="soft"
            highContrast
            size="1"
          >
            <DropdownMenu.Item shortcut="⌘ E">Edit</DropdownMenu.Item>
            <DropdownMenu.Item shortcut="⌘ D">Duplicate</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item shortcut="⌘ N">Archive</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  );
};

export const SearchInput = () => {};
