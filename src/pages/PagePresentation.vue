<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { init, use, type ECharts } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { ComposeOption } from 'echarts/core'
import type { BarSeriesOption } from 'echarts/charts'
import type {
  LegendComponentOption,
  GridComponentOption
} from 'echarts/components'

import { useStore } from '../store.ts'
import { useTransparentBackground } from '../utils.ts'

use([LegendComponent, GridComponent, BarChart, CanvasRenderer])

type EChartsOption = ComposeOption<
  | LegendComponentOption
  | GridComponentOption
  | BarSeriesOption
>

const props = defineProps<{
  question: string
  chart: 'bar' | 'stacked-bar'
}>()

const store = useStore()

watch(() => props.question, (v) => {
  if (v) {
    store.refreshAnswersOf(v)
  }
}, {
  immediate: true
})

const data = computed<{
  key: string
  title: string
  count: number
  correct: boolean
}[]>(() => {
  return store.questions.find((question) => {
    return question.id === props.question
  })?.options.map((option) => ({
    key: option.key,
    title: option.title,
    count: store.answersByQuestion[props.question]?.[option.key] ?? 0,
    correct: option.value > 0
  })) ?? []
})

const option = computed<EChartsOption | null>(() => {
  if (props.chart === 'stacked-bar') {
    return {
      legend: {},
      textStyle: {
        fontFamily: 'Fraunces, Noto Serif SC, serif'
      },
      grid: {
        left: '3%',
        right: '5%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        show: false
      },
      yAxis: {
        type: 'category',
        show: false
      },
      color: [
        '#0a3b68',
        '#7a1919'
      ],
      series: data.value.map((item) => ({
        name: `${item.key}: ${item.title}`,
        type: 'bar',
        stack: 'total',
        label: {
          show: item.count > 0,
          formatter: ({ value }) => {
            return `${item.key}: ${value}`
          },
          color: 'white',
          fontSize: 20,
        },
        data: [item.count]
      }))
    }
  }

  if (props.chart === 'bar') {
    return {
      grid: {
        left: '3%',
        right: '5%',
        bottom: '3%',
        top: '5%',
        containLabel: true
      },
      textStyle: {
        fontFamily: 'Fraunces, Noto Serif SC, serif'
      },
      xAxis: [{
        type: 'category',
        data: data.value.map((_, i) => i),
        position: 'top',
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          interval: 0,
          formatter: (index) => {
            const value = data.value[Number(index)]
            return `${value.key}: ${value.title}`
          },
          color: (index) => {
            const value = data.value[Number(index)]
            return value.correct ? '#7a1919' : '#312511'
          },
        },
      }],
      yAxis: {
        type: 'value',
        inverse: true,
        minInterval: 1,
        show: false
      },
      series: [
        {
          data: data.value.map((item) => ({
            value: item.count,
            itemStyle: {
              color: item.correct ? '#7a1919' : '#0a3b68'
            }
          })),
          label: {
            show: true,
            position: 'insideBottom',
            formatter: ({ value }) => {
              return value ? `${value}` : ''
            },
            color: 'white',
            fontSize: 20
          },
          type: 'bar'
        }
      ]
    }
  }

  return null
})

const canvas = ref<HTMLCanvasElement | null>(null)

let echarts: ECharts | null = null

watch(option, (v) => {
  if (echarts && v) {
    echarts.setOption(v)
  }
}, {
  immediate: true
})

onMounted(() => {
  echarts = init(canvas.value, 'default', {
    devicePixelRatio: 3,
    renderer: 'svg',
    width: 600,
    height: 150,
    locale: 'ZH'
  })
  if (option.value) {
    echarts.setOption(option.value)
  }
})

onBeforeUnmount(() => {
  if (echarts) {
    echarts.dispose()
    echarts = null
  }
})

useTransparentBackground()
</script>

<template>
  <canvas
    ref="canvas"
    class="w-full aspect-[4/1] pointer-events-none"
  />
</template>
