import { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getDataloom } from '@lark-apaas/client-toolkit/dataloom';
import { getDefaultBucketId } from '@lark-apaas/client-toolkit/tools/storage';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';

interface ImageUrlEditorProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export function ImageUrlEditor({ value, onChange }: ImageUrlEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const images = value.filter((url) => url.trim() !== '');

  const removeImage = (index: number): void => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const dataloom = await getDataloom();
      const bucketId = getDefaultBucketId();
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const { data, error } = await dataloom.storage
          .from(bucketId)
          .uploadFile(file);
        if (error || !data) {
          throw new Error(error?.message ?? '未知错误');
        }
        uploaded.push(data.download_url);
      }
      onChange([...images, ...uploaded]);
      toast.success(`成功上传 ${uploaded.length} 张图片`);
    } catch (err) {
      logger.error(`图片上传失败: ${String(err)}`);
      toast.error(`图片上传失败: ${String(err)}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000]"
            >
              <Image
                src={url}
                alt={`美食图片 ${index + 1}`}
                className="h-full w-full object-cover"
                width={200}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label="移除图片"
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-lg border-2 border-black bg-[#FF3B30] text-white shadow-[2px_2px_0_0_#000] transition-transform active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-fit gap-2 rounded-xl border-4 border-black bg-[#4CD964] font-black uppercase tracking-widest text-black shadow-[4px_4px_0_0_#000] hover:bg-[#4CD964] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {uploading ? '上传中...' : '上传图片'}
      </Button>
    </div>
  );
}
