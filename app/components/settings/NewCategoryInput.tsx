import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewCategoryInputProps {
    onAdd: (name: string) => void;
    isDarkMode: boolean;
    className?: string;
}

export function NewCategoryInput({ onAdd, isDarkMode, className }: NewCategoryInputProps) {
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            onAdd(value.trim());
            setValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className || ''}`}>
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="输入新分类名称..."
                className={`flex-1 h-9 text-sm ${isDarkMode ? 'bg-slate-800 border-white/10' : 'bg-slate-50 border-slate-200'}`}
            />
            <Button type="submit" size="sm" className="shrink-0 h-9">
                <Plus size={16} className="mr-1" /> 添加分类
            </Button>
        </form>
    );
}