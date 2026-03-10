import React, { useState } from 'react';
import { X, Brain, Lock, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const AIKeyModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-[kkFadeIn_0.3s_ease]">
            <div
                className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl border border-white/20 animate-[kkScaleIn_0.4s_cubic-bezier(0.16,1,0.3,1)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-8">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="p-4 bg-emerald-100 dark:bg-emerald-500/10 rounded-3xl text-emerald-600 mb-6">
                            <Brain size={48} />
                        </div>

                        <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-2">
                            {t('AI Power-Up Required')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-8">
                            {t('To use our advanced AI features, you need to integrate your personal Groq API key. This ensures high-speed responses and a dedicated processing queue for your farm.')}
                        </p>

                        <div className="w-full space-y-4 mb-8">
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-white/5 rounded-2xl border border-emerald-100 dark:border-white/10 text-left">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0">1</div>
                                <div>
                                    <p className="text-sm font-black text-gray-800 dark:text-white">{t('Get your free key')}</p>
                                    <a
                                        href="https://console.groq.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                                    >
                                        {t('Go to Groq Console')} <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-white/5 rounded-2xl border border-emerald-100 dark:border-white/10 text-left">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0">2</div>
                                <div>
                                    <p className="text-sm font-black text-gray-800 dark:text-white">{t('Add it to your profile')}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                        {t('Navigate to Settings > AI Settings to save your key.')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate('/profile?tab=ai');
                                }}
                                className="button button-primary w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={20} /> {t('Go to AI Settings')}
                            </button>

                            <div className="flex items-center gap-2 justify-center text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-xl">
                                <AlertCircle size={14} /> {t('Groq offers a generous free tier for all users.')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIKeyModal;
