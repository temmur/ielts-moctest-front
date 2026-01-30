// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabaseUrl = 'https://bhxmkzzrzjrtufazbtyn.supabase.co'
const supabaseAnonKey = 'sb_publishable_lTzYqYlwVmPIGiYEd3r0OQ_jQ0oIJO1'


export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to ensure buckets exist
// In src/services/supabase.js - Update ensureBucketsExist function

async function ensureBucketsExist() {
    const buckets = ['audio-files', 'section-images', 'writing-images']

    for (const bucket of buckets) {
        try {
            // First, try to list all buckets
            const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()

            if (listError) {
                console.error('Error listing buckets:', listError)
                continue
            }

            // Check if bucket exists
            const bucketExists = existingBuckets.some(b => b.name === bucket)

            if (!bucketExists) {
                console.log(`Creating bucket: ${bucket}`)
                const { error: createError } = await supabase.storage.createBucket(bucket, {
                    public: true,
                    fileSizeLimit: 52428800, // 50MB limit
                })

                if (createError) {
                    console.error(`Failed to create bucket ${bucket}:`, createError)

                    // If bucket creation fails, try to create it via REST API
                    await createBucketViaAPI(bucket)
                } else {
                    console.log(`Bucket ${bucket} created successfully`)
                }
            } else {
                console.log(`Bucket ${bucket} already exists`)
            }
        } catch (err) {
            console.error(`Exception checking bucket ${bucket}:`, err)
        }
    }
}

// Alternative method to create bucket using REST API
async function createBucketViaAPI(bucketName) {
    try {
        console.log(`Trying to create bucket ${bucketName} via REST API...`)

        // Get the service key from environment or use admin API
        const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || supabaseAnonKey

        const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${serviceKey}`,
                'apikey': supabaseAnonKey
            },
            body: JSON.stringify({
                name: bucketName,
                public: true,
                file_size_limit: 52428800,
                allowed_mime_types: null
            })
        })

        if (response.ok) {
            console.log(`Bucket ${bucketName} created via REST API`)
        } else {
            const error = await response.json()
            console.error(`Failed to create bucket ${bucketName} via REST API:`, error)
        }
    } catch (error) {
        console.error(`Error creating bucket ${bucketName} via REST API:`, error)
    }
}

// User service
export const userService = {
    // Get current user
    async getCurrentUser() {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError) {
                console.error('Auth error:', authError)
                return null
            }
            if (!user) return null

            // Get user profile from profiles table
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileError) {
                console.error('Profile error:', profileError)
                return { ...user, profile: null }
            }

            return { ...user, profile }
        } catch (error) {
            console.error('Error in getCurrentUser:', error)
            return null
        }
    },

    // Check if user is teacher
    async isTeacher(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                console.error('Error checking teacher role:', error)
                return false
            }

            return data?.role === 'teacher'
        } catch (error) {
            console.error('Error in isTeacher:', error)
            return false
        }
    }
}

// Test service
export const testService = {
    // Listening Tests
    async createListeningTest(testData, userId) {
        try {
            // First check if user is a teacher
            const isTeacher = await userService.isTeacher(userId)
            if (!isTeacher) {
                throw new Error('Only teachers can create tests')
            }

            const { data, error } = await supabase
                .from('listening_tests')
                .insert([{
                    title: testData.title,
                    duration: testData.duration,
                    description: testData.description,
                    created_by: userId,
                    total_parts: testData.parts?.length || 0,
                    total_sections: testData.parts?.reduce((acc, part) => acc + part.sections.length, 0) || 0,
                    total_questions: testData.parts?.reduce((acc, part) =>
                        acc + part.sections.reduce((secAcc, section) => secAcc + section.questions.length, 0), 0) || 0,
                    audio_url: testData.audioUrl || null
                }])
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error creating listening test:', error)
            throw error
        }
    },

    async createListeningSection(sectionData, testId, partNumber, sectionNumber) {
        try {
            const { data, error } = await supabase
                .from('listening_sections')
                .insert([{
                    test_id: testId,
                    title: sectionData.title,
                    content: sectionData.content,
                    part_number: partNumber,
                    section_number: sectionNumber,
                    order_number: sectionNumber,
                    question_type: sectionData.questionType,
                    question_count: sectionData.questions?.length || 0,
                    image_url: sectionData.imageUrl || null
                }])
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error creating listening section:', error)
            throw error
        }
    },
    async createListeningQuestion(questionData, sectionId, questionNumber) {
        const { data, error } = await supabase
            .from('listening_questions')
            .insert([{
                section_id: sectionId,
                question_text: questionData.text, // ✅ теперь есть
                order_number: questionNumber,
                question_type: questionData.type || 'note_completion'
            }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    async createListeningOptions(questionId, options, correctOptionId) {
        const payload = options.map((option, index) => ({
            question_id: questionId,
            option_label: String.fromCharCode(65 + index),
            option_text: option.text,
            is_correct: option.id === correctOptionId
        }))

        const { error } = await supabase
            .from('listening_options')
            .insert(payload)

        if (error) throw error
    },

    async createListeningAnswers(questionId, answers) {
        if (!Array.isArray(answers) || answers.length === 0) return

        const payload = answers.map((answer, index) => ({
            question_id: questionId,
            blank_number: index + 1,
            correct_answer: answer
        }))

        const { error } = await supabase
            .from('listening_answers')
            .insert(payload)

        if (error) throw error
    },

    // Reading Tests
    async createReadingTest(testData, userId) {
        try {
            // First check if user is a teacher
            const isTeacher = await userService.isTeacher(userId)
            if (!isTeacher) {
                throw new Error('Only teachers can create tests')
            }

            const { data, error } = await supabase
                .from('reading_tests')
                .insert([{
                    title: testData.title,
                    duration: testData.duration,
                    description: testData.description,
                    created_by: userId,
                    total_parts: testData.parts?.length || 0,
                    total_sections: testData.parts?.reduce((acc, part) => acc + part.sections.length, 0) || 0,
                    total_questions: testData.parts?.reduce((acc, part) =>
                        acc + part.sections.reduce((secAcc, section) => secAcc + section.questions.length, 0), 0) || 0
                }])
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error creating reading test:', error)
            throw error
        }
    },

    // async createReadingSection(sectionData, testId, partNumber, sectionNumber) {
    //     try {
    //         const { data, error } = await supabase
    //             .from('reading_sections')
    //             .insert([{
    //                 test_id: testId,
    //                 title: sectionData.title,
    //                 content: sectionData.content,
    //                 part_number: partNumber,
    //                 section_number: sectionNumber,
    //                 order_number: sectionNumber,
    //                 question_type: sectionData.questionType,
    //                 question_count: sectionData.questions?.length || 0,
    //                 image_url: sectionData.imageUrl || null
    //             }])
    //             .select()
    //             .single()
    //
    //         if (error) throw error
    //         return data
    //     } catch (error) {
    //         console.error('Error creating reading section:', error)
    //         throw error
    //     }
    // },
    // async createReadingSection(sectionData, testId, sectionNumber) {
    //
    //     const { data, error } = await supabase
    //         .from('reading_sections')
    //         .insert([{
    //             test_id: testId,
    //             section_number: sectionNumber,
    //             passage_title: sectionData.title,
    //             passage_text: sectionData.content,
    //             question_type: sectionData.questionType,
    //             image_url: sectionData.imageUrl || null,
    //         }])
    //         .select()
    //         .single()
    //
    //     if (error) throw error
    //     return data
    // },
    async createReadingSection(sectionData, testId, arg3, arg4) {
        // ✅ поддержка старого и нового вызова
        // old: createReadingSection(sectionData, testId, partNumber, sectionNumber)
        // new: createReadingSection(sectionData, testId, sectionNumber)

        const sectionNumber =
            typeof arg4 === "number" ? arg4 : arg3;

        const { data, error } = await supabase
            .from("reading_sections")
            .insert([{
                test_id: testId,
                section_number: sectionNumber,
                passage_title: sectionData.title || "",
                passage_text: sectionData.content || "",
                question_type: sectionData.questionType || "note_completion",
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // async createReadingQuestion(questionData, sectionId, questionNumber) {
    //     try {
    //         const { data, error } = await supabase
    //             .from('reading_questions')
    //             .insert([{
    //                 section_id: sectionId,
    //                 question_text: questionData.text,
    //                 question_number: questionNumber,
    //                 question_type: questionData.type,
    //                 correct_answer: questionData.answer,
    //                 options: questionData.options?.length > 0 ? questionData.options : null,
    //                 correct_option: questionData.correctOption || null,
    //                 matching_items: questionData.matchingItems?.length > 0 ? questionData.matchingItems : null,
    //                 matching_options: questionData.matchingOptions?.length > 0 ? questionData.matchingOptions : null
    //             }])
    //             .select()
    //             .single()
    //
    //         if (error) throw error
    //         return data
    //     } catch (error) {
    //         console.error('Error creating reading question:', error)
    //         throw error
    //     }
    // },

    async createReadingQuestion(questionData, sectionId, questionNumber) {
        const { data, error } = await supabase
            .from('reading_questions')
            .insert([{
                section_id: sectionId,
                order_number: questionNumber,
                question_text: questionData.text,
                question_type: questionData.type || 'note_completion'
            }])
            .select()
            .single()

        if (error) throw error
        return data
    },
    async createReadingOptions(questionId, options, correctOptionId) {
        const payload = options.map((option, index) => ({
            question_id: questionId,
            option_label: String.fromCharCode(65 + index),
            option_text: option.text,
            is_correct: option.id === correctOptionId
        }))

        const { error } = await supabase
            .from('reading_options')
            .insert(payload)

        if (error) throw error
    },
    async createReadingMatchingOptions(questionId, options) {
        const payload = options
            .filter(o => o.text && o.text.trim() !== '')
            .map((option, index) => ({
                question_id: questionId,
                option_label: String.fromCharCode(65 + index),
                option_text: option.text
            }))

        const { data, error } = await supabase
            .from('reading_matching_options')
            .insert(payload)
            .select()

        if (error) throw error
        return data
    },
    async createReadingMatchingItems(questionId, items, optionsFromDB) {
        const payload = items
            .filter(i => i.name && i.name.trim() !== '')
            .map(item => {
                const matchedOption = optionsFromDB.find(
                    opt => opt.option_label === item.matchedOption
                )

                return {
                    question_id: questionId,
                    item_text: item.name,
                    correct_option_id: matchedOption?.id || null
                }
            })

        const { error } = await supabase
            .from('reading_matching_items')
            .insert(payload)

        if (error) throw error
    },
    async createReadingAnswers(questionId, answers) {
        if (!Array.isArray(answers) || answers.length === 0) return

        const payload = answers.map((answer, index) => ({
            question_id: questionId,
            blank_number: index + 1,
            correct_answer: answer
        }))

        const { error } = await supabase
            .from('reading_answers')
            .insert(payload)

        if (error) {
            console.error('Error creating reading answers:', error)
            throw error
        }
    },

    // Writing Tests
    async createWritingTest(testData, userId) {
        console.log('image test 1:' + ' ' + testData.tasks?.task1?.imageUrl)
        try {
            // First check if user is a teacher
            const isTeacher = await userService.isTeacher(userId)
            if (!isTeacher) {
                throw new Error('Only teachers can create tests')
            }

            const { data, error } = await supabase
                .from('writing_tests')
                .insert([{
                    title: testData.title,
                    duration: testData.duration,
                    description: testData.description,
                    created_by: userId,
                    task1_title: testData.tasks?.task1?.title || '',
                    task1_question: testData.tasks?.task1?.question || '',
                    task1_min_words: testData.tasks?.task1?.minWords || 150,
                    task1_recommended_time: testData.tasks?.task1?.recommendedTime || 20,
                    task1_image_url: testData.tasks?.task1?.imageUrl || null,
                    task2_title: testData.tasks?.task2?.title || '',
                    task2_question: testData.tasks?.task2?.question || '',
                    task2_min_words: testData.tasks?.task2?.minWords || 250,
                    task2_recommended_time: testData.tasks?.task2?.recommendedTime || 40,
                    task2_essay_type: testData.tasks?.task2?.essayType || 'opinion',
                    task2_image_url: testData.tasks?.task2?.imageUrl || null
                }])
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error creating writing test:', error)
            throw error
        }
    },

    // File upload functions
    // Update the uploadFile function in supabase.js

    // async uploadFile(file, bucket, path) {
    //     try {
    //         // First, ensure bucket exists
    //         await this.createBucketIfNotExists(bucket)
    //
    //         const fileExt = file.name.split('.').pop().toLowerCase()
    //         const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    //         const filePath = path ? `${path}/${fileName}` : fileName
    //
    //         console.log(`Uploading to ${bucket}: ${filePath}`)
    //         console.log(`File: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`)
    //
    //         // Validate file size (50MB limit)
    //         if (file.size > 52428800) {
    //             throw new Error('File size exceeds 50MB limit')
    //         }
    //
    //         const { data, error } = await supabase.storage
    //             .from(bucket)
    //             .upload(filePath, file, {
    //                 cacheControl: '3600',
    //                 upsert: false,
    //                 contentType: file.type || this.getContentType(fileExt)
    //             })
    //
    //         if (error) {
    //             console.error('Storage upload error:', error)
    //             throw error
    //         }
    //
    //         console.log('Upload successful:', data)
    //
    //         // Get public URL
    //         const { data: urlData } = supabase.storage
    //             .from(bucket)
    //             .getPublicUrl(filePath)
    //
    //         const publicUrl = urlData.publicUrl
    //         console.log('Public URL:', publicUrl)
    //
    //         return publicUrl
    //
    //     } catch (error) {
    //         console.error('Error in uploadFile:', error)
    //         throw new Error(`File upload failed: ${error.message}`)
    //     }
    // },
    async uploadFile(file, bucket, path) {
        const fileExt = file.name.split('.').pop().toLowerCase()
        const fileName = `${Date.now()}_${crypto.randomUUID()}.${fileExt}`
        const filePath = path ? `${path}/${fileName}` : fileName

        if (file.size > 52428800) {
            throw new Error('File size exceeds 50MB limit')
        }

        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            })

        if (error) throw error

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

        return data.publicUrl
    },


    async createBucketIfNotExists(bucketName) {
        try {
            console.log(`Checking if bucket ${bucketName} exists...`)

            // List all buckets
            const { data: buckets, error } = await supabase.storage.listBuckets()

            if (error) {
                console.error('Error listing buckets:', error)
                throw new Error(`Cannot check bucket existence: ${error.message}`)
            }

            console.log('Available buckets:', buckets?.map(b => b.name))

            // Check if bucket exists
            const bucketExists = buckets?.some(b => b.name === bucketName)

            if (!bucketExists) {
                console.log(`Bucket ${bucketName} does not exist. Creating...`)

                try {
                    // Try to create bucket using client
                    const { error: createError } = await supabase.storage.createBucket(bucketName, {
                        public: true,
                        fileSizeLimit: 52428800, // 50MB
                    })

                    if (createError) {
                        console.error(`Failed to create bucket ${bucketName} via client:`, createError)

                        // Manual creation required
                        throw new Error(
                            `Storage bucket "${bucketName}" does not exist.\n\n` +
                            `Please create it manually in Supabase Dashboard:\n` +
                            `1. Go to Supabase Dashboard → Storage\n` +
                            `2. Click "New bucket"\n` +
                            `3. Name: "${bucketName}"\n` +
                            `4. Set as Public\n` +
                            `5. Create bucket`
                        )
                    } else {
                        console.log(`Bucket ${bucketName} created successfully`)
                    }
                } catch (createErr) {
                    console.error(`Cannot create bucket ${bucketName}:`, createErr)
                    throw createErr
                }
            } else {
                console.log(`Bucket ${bucketName} exists`)
            }
        } catch (error) {
            console.error(`Error in createBucketIfNotExists for ${bucketName}:`, error)
            throw error
        }
    },

    getContentType(fileExt) {
        const mimeTypes = {
            // Images
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            svg: 'image/svg+xml',
            webp: 'image/webp',
            // Audio
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            ogg: 'audio/ogg',
            m4a: 'audio/mp4',
            // Documents
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }

        return mimeTypes[fileExt] || 'application/octet-stream'
    },

    async uploadWritingImage(file, testId, taskNumber) {
        return this.uploadFile(file, 'writing-images', `${testId}/task${taskNumber}`)
    },

    async uploadSectionImage(file, testId, partNumber, sectionNumber) {
        return this.uploadFile(file, 'section-images', `${testId}/part${partNumber}/section${sectionNumber}`)
    },

    async uploadAudio(file, testId) {
        return this.uploadFile(file, 'audio-files', `${testId}`)
    },

    // Test management functions
    async updateListeningTestAudio(testId, audioUrl) {
        try {
            const { data, error } = await supabase
                .from('listening_tests')
                .update({ audio_url: audioUrl })
                .eq('id', testId)
                .select()
                .single()

            if (error) throw error
            return data
        } catch (error) {
            console.error('Error updating listening test audio:', error)
            throw error
        }
    },

    async updateWritingTestImage(testId, taskNumber, imageUrl) {
        try {
            const updateField = taskNumber === 1 ? 'task1_image_url' : 'task2_image_url'
            console.log(`Updating ${updateField} for test ${testId} with URL: ${imageUrl}`)

            const { data, error } = await supabase
                .from('writing_tests')
                .update({ [updateField]: imageUrl })
                .eq('id', testId)
                .select()
                .single()

            if (error) throw error
            console.log('Update successful:', data)
            return data
        } catch (error) {
            console.error('Error updating writing test image:', error)
            throw error
        }
    }
}
