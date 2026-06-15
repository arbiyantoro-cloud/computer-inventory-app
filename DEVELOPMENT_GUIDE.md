# API Services Template

Ini adalah template untuk service API yang bisa Anda develop lebih lanjut.

```javascript
// src/services/barangService.js
import { supabase } from '../config/supabase'

export const barangService = {
  getAll: async () => {
    const { data, error } = await supabase.from('master_barang').select('*')
    if (error) throw error
    return data
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('master_barang')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  create: async (barang) => {
    const { data, error } = await supabase
      .from('master_barang')
      .insert([barang])
    if (error) throw error
    return data
  },

  update: async (id, barang) => {
    const { data, error } = await supabase
      .from('master_barang')
      .update(barang)
      .eq('id', id)
    if (error) throw error
    return data
  },

  delete: async (id) => {
    const { data, error } = await supabase
      .from('master_barang')
      .delete()
      .eq('id', id)
    if (error) throw error
    return data
  },
}
```

# Custom Hooks Template

```javascript
// src/hooks/useBarang.js
import { useState, useEffect } from 'react'
import { barangService } from '../services/barangService'

export const useBarang = () => {
  const [barang, setBarang] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBarang()
  }, [])

  const fetchBarang = async () => {
    try {
      setLoading(true)
      const data = await barangService.getAll()
      setBarang(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { barang, loading, error, refetch: fetchBarang }
}
```

# Utility Functions Template

```javascript
// src/utils/formatters.js

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export const getStatusColor = (status) => {
  const colors = {
    aktif: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    rusak: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
```
