'use client';

import { api } from '@/api/client';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Transition,
} from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { Fragment } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function UserPlaceholder() {
  const { data: me, isLoading, error } = api.useQuery('get', '/v1/auth/me', {});
  const logoutMutation = api.useMutation('post', '/v1/auth/logout');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-3 p-2"
        >
          <Avatar className="h-8 w-8 bg-[#d9d9d9]">
            <AvatarFallback className="bg-[#d9d9d9] text-[#757575]">
              {me?.data?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-[#1d1b20]">{me?.data?.name}님</span>
          <ChevronDown className="ml-auto h-4 w-4 text-[#757575]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="z-50 w-48 bg-white *:cursor-pointer *:hover:bg-gray-100"
        sideOffset={4}
        alignOffset={0}
      >
        <DropdownMenuItem>프로필</DropdownMenuItem>
        <DropdownMenuItem>설정</DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            //get refreshToken
            const refreshToken = sessionStorage.getItem('refresh_token');

            if (!refreshToken) {
              console.error('No refresh token found');
              return;
            }

            logoutMutation.mutate(
              {
                body: {
                  refreshToken: refreshToken,
                },
              },
              {
                onSuccess: () => {
                  window.location.href = '/';
                },
                onError: (error) => {
                  console.error('Logout failed:', error);
                },
              },
            );
          }}
        >
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
