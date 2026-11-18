# Changelog

## [0.3.0](https://github.com/chechulina89/ai-for-developers-project-387/compare/v0.2.0...v0.3.0) (2026-11-18)


### Features

* add GitHub agent workflow with issue comment invocation ([c7c1d7e](https://github.com/chechulina89/ai-for-developers-project-387/commit/c7c1d7e654d9a8671692d5a15bca3746fba0a1ef))
* add independent PR review workflow ([#2](https://github.com/chechulina89/ai-for-developers-project-387/issues/2)) ([7d41968](https://github.com/chechulina89/ai-for-developers-project-387/commit/7d41968f7e7ba49282dbda6f23c566b1fad62735))
* add scheduled audit workflow ([#2](https://github.com/chechulina89/ai-for-developers-project-387/issues/2)) ([84e0a63](https://github.com/chechulina89/ai-for-developers-project-387/commit/84e0a63b2153549cfa0ebb03ebed758d6ef4ee5f))
* auto-triage new issues with opencode agent ([b11f847](https://github.com/chechulina89/ai-for-developers-project-387/commit/b11f847b22bd448c5775f64bf77db9a70d4f727b))
* disable unavailable booking dates ([#4](https://github.com/chechulina89/ai-for-developers-project-387/issues/4)) ([ccbed2c](https://github.com/chechulina89/ai-for-developers-project-387/commit/ccbed2c3b33d42ea36e0683c8d8187d9388a6d8b))
* run opencode agent from issue comments ([d446142](https://github.com/chechulina89/ai-for-developers-project-387/commit/d446142f7366e83198622cdf58de0157497b67c5))
* switch agent to faster free model ([a67f78a](https://github.com/chechulina89/ai-for-developers-project-387/commit/a67f78ace6402c51aee02cab92c106a471782e57))
* use free opencode/big-pickle model for the agent ([ede0c52](https://github.com/chechulina89/ai-for-developers-project-387/commit/ede0c5224aa3cee44e50cf8c5e51b4d479252eaf))


### Bug Fixes

* count re-run attempts in review budget ([#15](https://github.com/chechulina89/ai-for-developers-project-387/issues/15)) ([834b7e2](https://github.com/chechulina89/ai-for-developers-project-387/commit/834b7e2b4d7f70a3cc8055ebb79cc5df75ec1f22))
* declare groq provider explicitly in opencode.json ([#15](https://github.com/chechulina89/ai-for-developers-project-387/issues/15)) ([79577f1](https://github.com/chechulina89/ai-for-developers-project-387/commit/79577f161f5fcd284a1893f1bd0575ffeeedbf75))
* dedupe scheduled audit issues by finding key ([#2](https://github.com/chechulina89/ai-for-developers-project-387/issues/2)) ([3d6ee84](https://github.com/chechulina89/ai-for-developers-project-387/commit/3d6ee84c300c6eea84ad9db7ce1c4ce4555fac33))
* disable reasoning round-trip for groq gpt-oss ([#15](https://github.com/chechulina89/ai-for-developers-project-387/issues/15)) ([699c263](https://github.com/chechulina89/ai-for-developers-project-387/commit/699c263bbbc1441e2978b9cfa104f9240b9fe245))
* give groq triage an hour for the 8000 TPM cap ([#17](https://github.com/chechulina89/ai-for-developers-project-387/issues/17)) ([bdbdbf2](https://github.com/chechulina89/ai-for-developers-project-387/commit/bdbdbf28cd08abea801684df6793584e2830384d))
* let the triage agent label and comment via GH_TOKEN ([#17](https://github.com/chechulina89/ai-for-developers-project-387/issues/17)) ([8eae7bd](https://github.com/chechulina89/ai-for-developers-project-387/commit/8eae7bd60d27f179a36f347740afb844c72cebd2))
* make triage actions explicit tool calls ([#15](https://github.com/chechulina89/ai-for-developers-project-387/issues/15)) ([a8644f8](https://github.com/chechulina89/ai-for-developers-project-387/commit/a8644f8923b463f53606a0fedb42d4830dfc198c))
* move GEMINI_API_KEY to job-level env ([#15](https://github.com/chechulina89/ai-for-developers-project-387/issues/15)) ([6a4f1f8](https://github.com/chechulina89/ai-for-developers-project-387/commit/6a4f1f8db0a2901c1f455076171104bbf33e6eb5))
* pass GEMINI_API_KEY as step env, not a with input ([#15](https://github.com/chechulina89/ai-for-developers-project-387/issues/15)) ([8e1f345](https://github.com/chechulina89/ai-for-developers-project-387/commit/8e1f345a390fbad3592b8d0c7a54f68bbcd1d59c))
* return agent workflows to openrouter free tier ([#15](https://github.com/chechulina89/ai-for-developers-project-387/issues/15)) ([55f7e86](https://github.com/chechulina89/ai-for-developers-project-387/commit/55f7e86001cb0dd06b4ef71ba67bc7b01a415cc8))
* return agent workflows to openrouter free tier ([#17](https://github.com/chechulina89/ai-for-developers-project-387/issues/17)) ([b2c57ea](https://github.com/chechulina89/ai-for-developers-project-387/commit/b2c57ea8a5a16afffc84e204512627239fc41bda))
* return to openrouter free tier; record cerebras free-tier removal ([#15](https://github.com/chechulina89/ai-for-developers-project-387/issues/15)) ([7acfc31](https://github.com/chechulina89/ai-for-developers-project-387/commit/7acfc31f9c5b050e5e137facf9d75c6f3c34a9b3))
* review budget counts re-run attempts; agent evidence in artifacts ([a94dfc3](https://github.com/chechulina89/ai-for-developers-project-387/commit/a94dfc318cab594b858fbe72e6e2b70a9922994f))
* scope opencode concurrency for review comments ([#2](https://github.com/chechulina89/ai-for-developers-project-387/issues/2)) ([3ce546e](https://github.com/chechulina89/ai-for-developers-project-387/commit/3ce546ef0223637ab164aa585a9257454aeafaa1))
* slim triage prompt to fit free model speed ([20b3984](https://github.com/chechulina89/ai-for-developers-project-387/commit/20b3984d7566ebeaf4d445ccf7d2bc9c9669f350))
* stabilize conflict test and add review-comment trigger ([#2](https://github.com/chechulina89/ai-for-developers-project-387/issues/2)) ([95a19ee](https://github.com/chechulina89/ai-for-developers-project-387/commit/95a19eef356011a9ce8fe5606d7869fed4dffce7))
* switch agent workflows to cerebras free tier ([#15](https://github.com/chechulina89/ai-for-developers-project-387/issues/15)) ([ca78b5f](https://github.com/chechulina89/ai-for-developers-project-387/commit/ca78b5f307727cdadd8bee619d7be7785eb52440))
* switch agent workflows to opencode deepseek free model ([#17](https://github.com/chechulina89/ai-for-developers-project-387/issues/17)) ([e6a3cfe](https://github.com/chechulina89/ai-for-developers-project-387/commit/e6a3cfede32047efea21c5eb3eb14e7f5a124246))
* switch to groq free-plan model openai/gpt-oss-120b ([#15](https://github.com/chechulina89/ai-for-developers-project-387/issues/15)) ([d569802](https://github.com/chechulina89/ai-for-developers-project-387/commit/d5698021ab3cc1ff1c1d0e2719e0ccf93db3f25f))
* switch triage to zai glm-4.5-flash free tier ([#17](https://github.com/chechulina89/ai-for-developers-project-387/issues/17)) ([a8debf9](https://github.com/chechulina89/ai-for-developers-project-387/commit/a8debf9f81d3ea0dfd33ec240fc89e1db57d0f97))
* try groq gpt-oss-20b for triage ([#17](https://github.com/chechulina89/ai-for-developers-project-387/issues/17)) ([bf7105a](https://github.com/chechulina89/ai-for-developers-project-387/commit/bf7105ac59eda9951ef08ee5df766ef7531f35f0))
* try groq llama-3.1-8b-instant for triage ([#17](https://github.com/chechulina89/ai-for-developers-project-387/issues/17)) ([f832b11](https://github.com/chechulina89/ai-for-developers-project-387/commit/f832b119425161af185961616b0d6f2753234556))
* use env marker in audit dedupe jq filter ([#2](https://github.com/chechulina89/ai-for-developers-project-387/issues/2)) ([64b80ea](https://github.com/chechulina89/ai-for-developers-project-387/commit/64b80eadaa607390046f20de8db2a78750479257))
* use opencode nemotron free model for agent workflows ([#17](https://github.com/chechulina89/ai-for-developers-project-387/issues/17)) ([2c36596](https://github.com/chechulina89/ai-for-developers-project-387/commit/2c365962f0f7d39e96f91d8cf10e45964d244be1))

## [0.2.0](https://github.com/chechulina89/ai-for-developers-project-386/compare/v0.1.0...v0.2.0) (2026-11-13)

### Features

- add owner-managed meeting types ([#17](https://github.com/chechulina89/ai-for-developers-project-386/issues/17)) ([#26](https://github.com/chechulina89/ai-for-developers-project-386/issues/26)) ([feaf1f5](https://github.com/chechulina89/ai-for-developers-project-386/commit/feaf1f5e97a2cb9a86772a338f65b4f3804a50a4))
- implement booking flow ([#17](https://github.com/chechulina89/ai-for-developers-project-386/issues/17)) ([#25](https://github.com/chechulina89/ai-for-developers-project-386/issues/25)) ([846b63d](https://github.com/chechulina89/ai-for-developers-project-386/commit/846b63dfa78550f4e39ec54eac259de6d76cef1f))
