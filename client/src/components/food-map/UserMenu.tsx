import { User } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Image } from '@client/src/components/ui/image';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';
import { useFoodMapStore } from '@client/src/store/food-map-store';
import { useUserInfo } from '@client/src/api/user-info';

export function UserMenu() {
  const currentUser = useCurrentUserProfile();
  const { data: userInfo } = useUserInfo();
  const setProfilePanelOpen = useFoodMapStore((s) => s.setProfilePanelOpen);

  const avatarUrl = userInfo?.avatar || currentUser?.avatar || null;
  const displayName = userInfo?.nickname || currentUser?.name || '用户';

  return (
    <Button
      variant="ghost"
      onClick={() => setProfilePanelOpen(true)}
      className="flex items-center gap-2 rounded-xl border-4 border-black bg-white px-3 py-1.5 shadow-[3px_3px_0_0_#000] hover:bg-[#FFDE00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_#000]"
      aria-label="个人信息"
    >
      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-black">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <User className="h-5 w-5 text-black" />
        )}
      </div>
      <span className="hidden text-sm font-black uppercase tracking-tight text-black sm:inline">
        {displayName}
      </span>
    </Button>
  );
}