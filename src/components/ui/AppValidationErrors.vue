<template>
  <div v-if="hasErrors" class="validation-errors" role="alert">
    <strong>{{ title }}</strong>
    <ul>
      <li v-for="item in flattenedErrors" :key="item.key">
        <span v-if="item.field">{{ item.field }}:</span>
        {{ item.message }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    errors?: Record<string, string[] | string>
    title?: string
  }>(),
  {
    errors: () => ({}),
    title: 'Please fix the following validation errors.',
  },
)

const flattenedErrors = computed(() =>
  Object.entries(props.errors).flatMap(([field, messages]) => {
    const list = Array.isArray(messages) ? messages : [messages]
    return list.map((message, index) => ({
      key: `${field}-${index}-${message}`,
      field: field === '$' ? '' : field,
      message,
    }))
  }),
)

const hasErrors = computed(() => flattenedErrors.value.length > 0)
</script>

<style scoped>
.validation-errors {
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
  color: #7f1d1d;
  padding: 12px;
}

strong {
  display: block;
  font-size: 13px;
  margin-bottom: 8px;
}

ul {
  margin: 0;
  padding-left: 18px;
}

li {
  font-size: 13px;
  margin-top: 4px;
}

span {
  font-weight: 800;
}
</style>
