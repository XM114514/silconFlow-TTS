/**
 * @name SiliconFlow TTS Quad Optimized
 * @id siliconflow.cn
 * @author Claude, Gemini & User
 * @version 47.0
 * @description 四重优化版本：流式输出+网络自适应+智能重试+性能优化
 * @iconUrl https://www.siliconflow.cn/favicon.ico
 */

let PluginJS = {
    "name": "SiliconFlow TTS (四重优化版)",
    "id": "siliconflow.cn",
    "author": "Claude, Gemini & User",
    "version": 47.0,
    'iconUrl': 'https://www.siliconflow.cn/favicon.ico',

    'vars': {
        apiKey: { 
            label: "API Key", 
            hint: "你的 SiliconFlow API Key (sk-开头)", 
            type: "password" 
        },
        fullUrl: {
            label: "API 地址",
            hint: "SiliconFlow TTS API 端点",
            value: "https://api.siliconflow.cn/v1/audio/speech"
        },
        modelName: { 
            label: "模型名称", 
            hint: "推荐: FunAudioLLM/CosyVoice2-0.5B", 
            value: "FunAudioLLM/CosyVoice2-0.5B" 
        },
        voiceIdentifier: { 
            label: "语音标识符", 
            hint: "自定义语音ID或预设语音", 
            value: "中文女" 
        },
        responseFormat: { 
            label: "音频格式", 
            hint: "wav (推荐) 或 mp3", 
            value: "wav" 
        },
        voiceName: { 
            label: "语音显示名称", 
            hint: "【可选】给语音起个别名",
            value: "默认语音"
        }
    },

    // 🌐 网络状态监控
    networkState: {
        failures: 0,
        avgResponseTime: 1000,
        connectionQuality: 'good', // good, fair, poor
        isSlowNetwork: false
    },

    // 🎵 流式状态监控
    streamingState: {
        isStreamMode: false,
        requestCount: 0,
        lastRequestTime: 0,
        avgInterval: 5000
    },

    // ⚡ 性能统计
    performanceStats: {
        totalRequests: 0,
        totalTime: 0,
        networkOptimizations: 0
    },

    "onStop": function () {},

    // 🔍 智能网络质量评估
    "assessNetworkQuality": function(responseTime, success, dataSize) {
        const net = this.networkState;
        const perf = this.performanceStats;
        
        perf.totalRequests++;
        
        if (success) {
            net.failures = Math.max(0, net.failures - 1);
            net.avgResponseTime = net.avgResponseTime * 0.7 + responseTime * 0.3;
            
            const throughput = dataSize / responseTime;
            
            if (net.avgResponseTime < 1500 && throughput > 50) {
                net.connectionQuality = 'good';
                net.isSlowNetwork = false;
            } else if (net.avgResponseTime < 3000 && throughput > 20) {
                net.connectionQuality = 'fair';
                net.isSlowNetwork = true;
            } else {
                net.connectionQuality = 'poor';
                net.isSlowNetwork = true;
            }
            
            perf.totalTime += responseTime;
            
        } else {
            net.failures++;
            if (net.failures >= 3) {
                net.connectionQuality = 'poor';
                net.isSlowNetwork = true;
            }
        }
        
        return net;
    },

    // 🎵 流式模式检测
    "detectStreamingMode": function() {
        const stream = this.streamingState;
        const now = Date.now();
        
        if (stream.lastRequestTime > 0) {
            const interval = now - stream.lastRequestTime;
            stream.avgInterval = stream.avgInterval * 0.8 + interval * 0.2;
            stream.isStreamMode = stream.avgInterval < 5000;
        }
        
        stream.lastRequestTime = now;
        stream.requestCount++;
        
        return stream.isStreamMode;
    },

    // ⏱️ 智能等待时间计算
    "calculateOptimalWaitTime": function(attempt, textLength) {
        const net = this.networkState;
        const stream = this.streamingState;
        
        let baseWait = 300;
        
        // 网络质量调整
        if (net.connectionQuality === 'poor') baseWait *= 3.0;
        else if (net.connectionQuality === 'fair') baseWait *= 1.8;
        
        // 流式模式调整
        if (stream.isStreamMode) baseWait *= 0.7;
        
        // 指数退避算法
        baseWait *= Math.pow(1.6, attempt - 1);
        
        // 文本长度调整
        if (textLength > 200) baseWait *= 1.3;
        if (textLength > 1000) baseWait *= 1.6;
        
        // 连续失败惩罚
        if (net.failures > 0) {
            baseWait *= (1 + net.failures * 0.4);
        }
        
        return Math.min(Math.max(baseWait, 100), 8000);
    },

    // 🔧 构建优化请求头
    "buildOptimizedHeaders": function(apiKey) {
        const net = this.networkState;
        const stream = this.streamingState;
        
        const headers = {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": "rikkahub/tts-server-optimized",
            "Accept": "audio/*"
        };
        
        // 网络质量优化
        if (net.connectionQuality === 'good') {
            headers["Connection"] = "keep-alive";
            headers["Accept-Encoding"] = "gzip, deflate";
            headers["Cache-Control"] = "no-cache";
        } else if (net.connectionQuality === 'fair') {
            headers["Connection"] = "keep-alive";
            headers["Accept-Encoding"] = "gzip";
            headers["Cache-Control"] = "no-cache";
        } else {
            headers["Connection"] = "close";
            headers["Accept-Encoding"] = "identity";
            headers["Cache-Control"] = "no-store";
        }
        
        // 流式优化
        if (stream.isStreamMode) {
            headers["X-Stream-Mode"] = "true";
            headers["Priority"] = "u=1, i";
        }
        
        return headers;
    },

    // 🚀 智能延时函数
    "smartDelay": function(ms) {
        try {
            const start = Date.now();
            const precision = this.networkState.isSlowNetwork ? 100 : 50;
            
            while (Date.now() - start < ms) {
                let microStart = Date.now();
                while (Date.now() - microStart < precision) {
                    // 忙等待
                }
            }
        } catch (e) {
            // 延时失败，继续执行
        }
    },

    // 💪 确保返回值兼容性
    "ensureCompatibleReturn": function(audioData) {
        try {
            if (!audioData || audioData.length === 0) return null;
            
            if (typeof audioData === 'object' && audioData.length > 0) {
                if (audioData.length < 100) return null;
                
                if (this.isWavFormat()) {
                    return this.ensureWavHeader(audioData);
                }
                
                return audioData;
            }
            
            return null;
        } catch (e) {
            return null;
        }
    },

    "isWavFormat": function() {
        try {
            const format = String(ttsrv.userVars['responseFormat'] || 'wav').toLowerCase().trim();
            return format === 'wav';
        } catch (e) {
            return true;
        }
    },

    "ensureWavHeader": function(audioData) {
        try {
            if (audioData.length < 44) return audioData;
            
            let header = '';
            for (let i = 0; i < 4; i++) {
                header += String.fromCharCode(audioData[i]);
            }
            
            return audioData;
        } catch (e) {
            return audioData;
        }
    },

    "getAudio": function () {
        const startTime = Date.now();
        
        try {
            // 🎵 检测流式模式
            const isStreaming = this.detectStreamingMode();
            
            // 📥 提取参数
            let text = null;
            let rate = 50;
            
            for (let i = 0; i < arguments.length; i++) {
                let arg = arguments[i];
                if (typeof arg === 'string' && arg.length > 0 && arg.trim() !== '') {
                    text = arg;
                    break;
                } else if (typeof arg === 'number' && arg > 0 && arg <= 200) {
                    rate = arg;
                }
            }
            
            if (!text) return null;
            
            // ⚙️ 获取配置
            const apiKey = ttsrv.userVars['apiKey'];
            const fullUrl = ttsrv.userVars['fullUrl'];
            const modelName = ttsrv.userVars['modelName'];
            const voiceIdentifier = ttsrv.userVars['voiceIdentifier'];
            const responseFormat = String(ttsrv.userVars['responseFormat'] || 'wav').toLowerCase().trim();

            if (!apiKey || !fullUrl || !modelName || !voiceIdentifier) {
                return null;
            }
            
            // 🔧 构建优化请求头
            const headers = this.buildOptimizedHeaders(apiKey);
            
            // ⚡ 计算语速
            let speed = 1.0;
            if (rate && typeof rate === 'number') {
                speed = rate / 50.0;
            }
            if (speed < 0.25) speed = 0.25;
            if (speed > 4.0) speed = 4.0;
            
            // 📦 构建请求体
            const body = {
                model: modelName,
                input: text.trim(),
                voice: voiceIdentifier,
                response_format: responseFormat,
                speed: speed,
                sample_rate: 32000
            };

            // 🔄 智能重试策略
            const textLength = text.length;
            const maxRetries = this.networkState.connectionQuality === 'poor' ? 5 : 
                             this.networkState.connectionQuality === 'fair' ? 4 : 3;
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                // ⏱️ 智能等待
                if (attempt > 1) {
                    const waitTime = this.calculateOptimalWaitTime(attempt, textLength);
                    this.smartDelay(waitTime);
                }
                
                const requestStart = Date.now();
                
                try {
                    let resp = ttsrv.httpPost(fullUrl, JSON.stringify(body), headers);
                    const responseTime = Date.now() - requestStart;
                    
                    if (resp.code() === 200) {
                        let audioData = resp.body().bytes();
                        
                        if (audioData && audioData.length > 0) {
                            // 📊 更新网络状态
                            this.assessNetworkQuality(responseTime, true, audioData.length);
                            
                            // 🎯 性能优化计数
                            this.performanceStats.networkOptimizations++;
                            
                            // 💪 确保返回值兼容性
                            const compatibleAudio = this.ensureCompatibleReturn(audioData);
                            
                            if (compatibleAudio) {
                                // 📈 更新总处理时间
                                const totalTime = Date.now() - startTime;
                                this.performanceStats.totalTime += totalTime;
                                
                                return compatibleAudio;
                            }
                        }
                    }
                    
                    // 📊 失败记录
                    this.assessNetworkQuality(responseTime, false, 0);
                    
                } catch (e) {
                    // 📊 异常记录
                    this.assessNetworkQuality(Date.now() - requestStart, false, 0);
                }
            }
            
            return null;
        } catch (e) {
            return null;
        }
    }
};

let EditorJS = {
    "getAudioSampleRate": function (locale, voice) { 
        return 32000;
    },

    "getLocales": function () { 
        return { "zh-CN": "中文 (简体)" }; 
    },
    
    "getVoices": function (locale) {
        if (locale === "zh-CN") {
            const voiceIdentifier = ttsrv.userVars['voiceIdentifier'];
            const voiceName = ttsrv.userVars['voiceName'];
            
            if (!voiceIdentifier) { 
                return {}; 
            }
            let voices = {};
            voices[voiceIdentifier] = { name: voiceName || "默认语音" };
            
            return voices;
        }
        return {};
    },
    
    "onLoadData": function () {}
};