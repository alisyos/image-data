'use client';

import { useState, useEffect } from 'react';

interface Backup {
  filename: string;
  createdAt: string;
  modifiedAt: string;
  size: number;
  preview: string;
  charCount: number;
  version?: number;
  modifiedBy?: string;
}

interface BackupListProps {
  onRestore: () => Promise<void>;
}

export default function BackupList({ onRestore }: BackupListProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/prompt/backups');
      if (!response.ok) {
        throw new Error('백업 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setBackups(data.backups);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backup: Backup) => {
    const versionText = backup.version ? `버전 ${backup.version}` : backup.filename;
    if (!confirm(`${versionText}으로 프롬프트를 복원하시겠습니까?`)) {
      return;
    }
    
    setRestoring(backup.filename);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/prompt/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version: backup.version }),
      });
      
      if (!response.ok) {
        throw new Error('프롬프트 복원에 실패했습니다.');
      }
      
      await onRestore();
      await loadBackups(); // 백업 목록 새로고침
    } catch (err) {
      setError(err instanceof Error ? err.message : '복원 중 오류가 발생했습니다.');
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-sm text-gray-600">백업 목록을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">백업 목록</h3>
        <button
          onClick={loadBackups}
          className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          새로고침
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {backups.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">백업된 프롬프트가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {backups.map((backup) => (
            <div key={backup.filename} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    {backup.version ? `버전 ${backup.version}` : backup.filename}
                    {backup.modifiedBy && (
                      <span className="ml-2 text-xs text-gray-500">
                        by {backup.modifiedBy}
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{formatDate(backup.createdAt)}</span>
                    <span>{formatFileSize(backup.size)}</span>
                    <span>{backup.charCount.toLocaleString()}자</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleRestore(backup)}
                  disabled={restoring === backup.filename}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {restoring === backup.filename ? '복원 중...' : '복원'}
                </button>
              </div>
              
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-600 font-mono leading-relaxed">
                  {backup.preview}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}