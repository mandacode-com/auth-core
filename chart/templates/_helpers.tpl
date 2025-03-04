{{/*
Expand the name of the chart.
*/}}
{{- define "auth-core.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "auth-core.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "auth-core.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "auth-core.labels" -}}
helm.sh/chart: {{ include "auth-core.chart" . }}
{{ include "auth-core.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "auth-core.selectorLabels" -}}
app.kubernetes.io/name: {{ include "auth-core.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "auth-core.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "auth-core.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
  Auto mailer
*/}}
{{- define "auth-core.auto_mailer.url" -}}
{{ printf "%s:%s" .Values.auto_mailer.host (toString .Values.auto_mailer.port) }}
{{- end -}}

{{/*
  Database
*/}}
{{- define "auth-core.database.url" -}}
{{ printf "postgresql://%s:%s@%s:%s/%s" .Values.database.auth.username .Values.database.auth.password .Values.database.host (toString .Values.database.port) .Values.database.name }}
{{- end -}}

{{/*
  Redis session store
*/}}
{{- define "auth-core.redis.url" -}}
{{- if .Values.redis.password -}}
{{ printf "redis://:%s@%s:%s" .Values.redis.password .Values.redis.host (toString .Values.redis.port) }}
{{- else -}}
{{ printf "redis://%s:%s" .Values.redis.host (toString .Values.redis.port) }}
{{- end -}}
{{- end -}}

{{/*
  Cookie
*/}}
{{- define "auth-core.cookie.secretName" -}}
{{- if .Values.cookie.secretName -}}
{{ .Values.cookie.secretName }}
{{- else -}}
{{ printf "%s-cookie-secret" .Release.Name }}
{{- end -}}
{{- end -}}

{{/*
  JWT
*/}}
{{- define "auth-core.jwt.access.secretName" -}}
{{- if .Values.jwt.access.secretName -}}
{{ .Values.jwt.access.secretName }}
{{- else -}}
{{ printf "%s-jwt-access-secret" .Release.Name }}
{{- end -}}
{{- end -}}

{{- define "auth-core.jwt.refresh.secretName" -}}
{{- if .Values.jwt.refresh.secretName -}}
{{ .Values.jwt.refresh.secretName }}
{{- else -}}
{{ printf "%s-jwt-refresh-secret" .Release.Name }}
{{- end -}}
{{- end -}}

{{- define "auth-core.jwt.email_verification.secretName" -}}
{{- if .Values.jwt.email_verification.secretName -}}
{{ .Values.jwt.email_verification.secretName }}
{{- else -}}
{{ printf "%s-jwt-email-secret" .Release.Name }}
{{- end -}}
{{- end -}}
