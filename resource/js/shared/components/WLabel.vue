<script setup>
import { computed, ref } from 'vue'
import Help from '@/components/common/Help.vue'
import { useTooltipData } from '@/composable/useTooltipData'

const props = defineProps({
  // Link props
  href: {
    type: String,
    default: '',
  },
  target: {
    type: String,
    default: '_self',
  },
  // Style props
  size: {
    type: String,
    default: 'lg',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
  },
  color: {
    type: String,
    default: 'text-black',
  },
  // Text formatting
  weight: {
    type: String,
    default: 'normal',
    validator: (value) => ['light', 'normal', 'medium', 'semibold', 'bold'].includes(value),
  },
  align: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'center', 'right', 'justify'].includes(value),
  },
  // Heading props
  tag: {
    type: String,
    default: 'div',
    validator: (value) =>
      ['', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'].includes(value),
  },
  subheading: {
    type: Boolean,
    default: false,
  },
  // Text transforms
  uppercase: {
    type: Boolean,
    default: false,
  },
  capitalize: {
    type: Boolean,
    default: false,
  },
  truncate: {
    type: Boolean,
    default: false,
  },
  // Interaction props
  clickable: {
    type: Boolean,
    default: false,
  },
  tooltip: {
    type: String,
    default: '',
  },
  dataKey: {
    type: String,
    default: '',
  },
  underline: {
    type: Boolean,
    default: false,
  },
  tooltipClass: {
    type: String,
    default: '',
  },
  helpLinkKey: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits(['click'])
const helpLinkRef = ref(null)
const isHeading = computed(() => props.tag.startsWith('h'))

const { computedTooltip } = useTooltipData(props)

const computedTag = computed(() => {
  if (props.href) return 'a'
  if (props.tag) return props.tag
  return 'span'
})

const handleClick = (event) => {
  if (props.helpLinkKey && helpLinkRef.value) {
    helpLinkRef.value.handleHelpLink()
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="computedTag"
    :href="href"
    :target="target"
    class="w-label"
    :class="[
      `weight-${weight}`,
      {
        href: href,
        'cursor-pointer': href || clickable || helpLinkKey,
        'text-primary': href && !color,
        [`text-${color}`]: color,
        'w-label--heading': isHeading,
        'w-label--subheading': subheading,
        'w-label--truncate': truncate,
        'w-label--uppercase': uppercase,
        'w-label--capitalize': capitalize,
        [`text-${align}`]: align,
        'text-underline': underline,
      },
    ]"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot />
    <QTooltip v-if="computedTooltip" :class="tooltipClass">
      {{ computedTooltip }}
    </QTooltip>
  </component>

  <Help ref="helpLinkRef" :helpLinkKey="helpLinkKey" class="q-ml-md" fromWLabel />
</template>

<style lang="scss" scoped>
.w-label {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  // Size variants
  &.text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }

  &.text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  &.text-md {
    font-size: 1rem;
    line-height: 1.5rem;
  }

  &.text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  &.text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  // Font weights
  &.weight-light {
    font-weight: 300;
  }

  &.weight-normal {
    font-weight: 400;
  }

  &.weight-medium {
    font-weight: 500;
  }

  &.weight-semibold {
    font-weight: 600;
  }

  &.weight-bold {
    font-weight: 700;
  }

  // Text alignment
  &.text-left {
    text-align: start;
  }

  &.text-center {
    text-align: center;
  }

  &.text-right {
    text-align: end;
  }

  &.text-justify {
    text-align: justify;
  }

  // Heading styles
  &.w-label--heading {
    display: block;
    font-weight: 600;
    inline-size: 100%;

    &.text-xs {
      font-size: 1rem;
      line-height: 1.5;
    }

    &.text-sm {
      font-size: 1.25rem;
      line-height: 1.5;
    }

    &.text-md {
      font-size: 1.5rem;
      line-height: 1.5;
    }

    &.text-lg {
      font-size: 1.875rem;
      line-height: 1.5;
    }

    &.text-xl {
      font-size: 2.25rem;
      line-height: 1.5;
    }
  }

  // Subheading styles
  &.w-label--subheading {
    color: rgba(var(--v-theme-on-surface), 0.7);
    font-weight: 400;
  }

  // Text transforms
  &.w-label--uppercase {
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  &.w-label--capitalize {
    text-transform: capitalize;
  }

  &.w-label--truncate {
    overflow: hidden;
    max-inline-size: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.cursor-pointer {
    cursor: pointer;
  }

  &.href {
    color: var(--q-primary);
    text-decoration: underline;
  }

  &.text-underline {
    text-decoration: underline;
  }
}
</style>
