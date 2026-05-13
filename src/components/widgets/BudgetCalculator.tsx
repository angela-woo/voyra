'use client'

import { useState } from 'react'
import { Calculator, Plus, Trash2 } from 'lucide-react'

interface BudgetItem {
  id: string
  label: string
  amount: number
  currency: string
}

const CURRENCIES = ['KRW', 'USD', 'EUR', 'JPY', 'THB', 'SGD']

const RATES_TO_KRW: Record<string, number> = {
  KRW: 1, USD: 1350, EUR: 1480, JPY: 9.2, THB: 38, SGD: 1010,
}

export default function BudgetCalculator() {
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', label: '항공', amount: 0, currency: 'KRW' },
    { id: '2', label: '숙박', amount: 0, currency: 'KRW' },
    { id: '3', label: '식비', amount: 0, currency: 'KRW' },
  ])

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), label: '', amount: 0, currency: 'KRW' }])
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const totalKRW = items.reduce((sum, item) => sum + item.amount * (RATES_TO_KRW[item.currency] ?? 1), 0)

  return (
    <div className="bg-white rounded-[var(--radius)] border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4 text-[var(--primary)]" />
        여행 예산 계산기
      </h3>
      <div className="space-y-3 mb-4">
        {items.map(item => (
          <div key={item.id} className="space-y-1.5">
            <input
              value={item.label}
              onChange={e => updateItem(item.id, 'label', e.target.value)}
              placeholder="항목명"
              className="w-full text-sm border border-gray-200 rounded-[var(--radius)] px-2 py-1.5 focus:outline-none focus:border-[var(--primary)]"
            />
            <div className="flex gap-1.5 items-center">
              <input
                type="number"
                value={item.amount || ''}
                onChange={e => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                placeholder="금액"
                className="flex-1 min-w-0 text-sm border border-gray-200 rounded-[var(--radius)] px-2 py-1.5 focus:outline-none focus:border-[var(--primary)]"
              />
              <select
                value={item.currency}
                onChange={e => updateItem(item.id, 'currency', e.target.value)}
                className="text-sm border border-gray-200 rounded-[var(--radius)] px-2 py-1.5 focus:outline-none focus:border-[var(--primary)]"
              >
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={() => removeItem(item.id)} className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={addItem}
        className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline mb-4"
      >
        <Plus className="w-4 h-4" /> 항목 추가
      </button>
      <div className="border-t border-gray-100 pt-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">총 예산 (원화 기준)</span>
          <span className="font-bold text-lg text-[var(--primary)]">
            ₩{totalKRW.toLocaleString('ko-KR')}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">* 환율은 참고용 값입니다</p>
      </div>
    </div>
  )
}
