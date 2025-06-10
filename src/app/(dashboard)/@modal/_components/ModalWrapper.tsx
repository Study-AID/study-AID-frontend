'use client';

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

export default function ModalWrapper({
  children,
  size,
}: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const router = useRouter();

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => router.back()}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        {/* Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className={`w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all ${size === 'sm' ? 'max-w-sm' : size === 'md' ? 'max-w-md' : size === 'lg' ? 'max-w-lg' : size === 'xl' ? 'max-w-xl' : ''}`}
              >
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>

    // <div className="fixed inset-0 z-50 flex items-center justify-center">
    //   <div
    //     className="absolute inset-0 bg-black opacity-50"
    //     onClick={() => {
    //       router.back();
    //     }}
    //   />
    //   <div className="z-10 rounded-lg bg-white p-6 shadow-lg">{children}</div>
    // </div>
  );
}
