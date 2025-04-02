import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import type { Environment, EnvironmentModel, EnvironmentVersion, ModelMetadata } from '@envops-cms/model';
import type { Comparison } from '@envops-cms/utils';

export type ModelReportData = {
  environment: Environment,
  version: EnvironmentVersion
}

export type ComparisonReportData = {
  metadata: {
    source: ModelMetadata,
    target: ModelMetadata
  }
  comparison: Comparison<EnvironmentModel> // TODO
}

//@ts-expect-error injectedData is replaced by vite
const { modelReport, comparisonReport } = injectedData as { modelReport?: ModelReportData, comparisonReport?: ComparisonReportData };

const app = mount(App, {
  target: document.getElementById('app')!,
  props: {
    modelReport,
    comparisonReport
  },
})

export default app
