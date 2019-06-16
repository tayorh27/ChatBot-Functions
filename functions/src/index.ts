import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const receiveMessages = functions.database.ref('/rooms/{roomId}/messages/{messageId}').onCreate((snapshot, context) => {

    const roomId = context.params.roomId;
    //const messageId = context.params.messageId;
    const messageData = snapshot.val();

    const user_text = `${messageData.text}`.toLowerCase();
    const type = `${messageData.display_type}`;
    const extra_data = `${messageData.extra_data}`;
    const extra_data_value = messageData.extra_data;

    const keyId = `${admin.database().ref().push().key}`;

    //options from job

    if (type == 'user') { //
        const mDate = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
        const positiveResponse = "yea yeah sure ok alright yes";//user_text.includes("yes")
        const start_text = "hi hello help tara";

        if (extra_data_value != undefined) {
            if (start_text.search(user_text) > 0) {
                return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'text': "Hi I am Tara, your talent and career assistant.<br>Are you a job seeker or an employer?<br>[Job seeker]<br>[Employer]"
                });
            } else {
                if (extra_data == 'experience') {
                    return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                        'display_type': 'bot',
                        'created_date': mDate,
                        'extra_data': 'study',
                        'text': "What did you study?"
                    });
                } else if (extra_data == 'study') {
                    return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                        'display_type': 'bot',
                        'created_date': mDate,
                        'extra_data': 'career',
                        'text': "Are you considering a career change?"
                    });
                } else if (extra_data == 'career') {
                    if (positiveResponse.search(user_text) > 0) {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'field',
                            'text': "Based on available jobs and ease of entry, we will like to recommend you switch to <b>IT & Software</b>.<br>However you can choose any of these fields.<br>1. IT & Software<br>2. Accounting<br>3. Agriculture<br> 4. Sales"
                        }).then(t => {
                            const keyId2 = `${snapshot.ref.ref.push().key}`;
                            return admin.database().ref(`rooms/${roomId}/messages`).child(keyId2).set({
                                'display_type': 'bot',
                                'created_date': mDate,
                                'extra_data': 'field',
                                'text': 'What would it be?'
                            });
                        });
                    } else {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'profession',
                            'text': "That's fine, in what profession do you work currently?"
                        });
                    }
                } else if (extra_data == 'profession') {
                    return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                        'display_type': 'bot',
                        'created_date': mDate,
                        'extra_data': 'career_yes',
                        'text': "For how long have you worked professionally?<br>[0]<br>[less than 6 months]<br>[1 year]<br>[2 years]<br>[3 years]<br>[3+ years]"
                    });
                } else if (extra_data == 'career_yes') {
                    return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                        'display_type': 'bot',
                        'created_date': mDate,
                        'extra_data': 'field',
                        'text': "Based on available jobs and ease of entry, we will like to recommend you switch to <b>IT & Software</b>.<br>However you can choose any of these fields.<br>1. IT & Software<br>2. Accounting<br>3. Agriculture<br> 4. Sales"
                    }).then(t => {
                        const keyId2 = `${snapshot.ref.ref.push().key}`;
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId2).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'field',
                            'text': 'What would it be?'
                        });
                    });
                } else if (extra_data == 'field') {
                    let container = "it & software accounting agricultural sales 1 2 3 4"
                    //let re = `${user_text}`
                    if (container.search(user_text) == -1) {// || user_text != `accounting` || !user_text.startsWith("agriculture") || !user_text.startsWith("sales") || !user_text.startsWith("1") || !user_text.startsWith("2") || !user_text.startsWith("3") || !user_text.startsWith("4")
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'field',
                            'text': "Sorry, I didn't get that. Please choose again."
                        }).then(t => {
                            const keyId2 = `${snapshot.ref.ref.push().key}`;
                            return admin.database().ref(`rooms/${roomId}/messages`).child(keyId2).set({
                                'display_type': 'bot',
                                'created_date': mDate,
                                'extra_data': 'field',
                                'text': "You can choose any of these fields.<br>1. IT & Software<br>2. Accounting<br>3. Agriculture<br> 4. Sales"
                            });
                        });
                    } else {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'location',
                            'text': 'What location will you prefer?<br><br>[Abuja]<br>[Lagos]<br>[Port Harcourt]'
                        }).then(t => {
                            return saveUserJobPreference(roomId, 'job', user_text);
                        });
                    }
                } else if (extra_data == 'location') {
                    if (user_text.includes("abuja") || user_text.includes("lagos") || user_text.includes("port harcourt")) {
                        var getSelectedJob = '';
                        return getUserJobSelected(roomId).then(result => {
                            const job_selected = result.val();
                            if (job_selected == '1' || job_selected.includes('it & software')) {
                                getSelectedJob = 'IT & Software';
                            } else if (job_selected == '2' || job_selected.includes('accounting')) {
                                getSelectedJob = 'Accounting';
                            } else if (job_selected == '3' || job_selected.includes('agriculture')) {
                                getSelectedJob = 'Agriculture';
                            } else if (job_selected == '4' || job_selected.includes('sales')) {
                                getSelectedJob = 'Sales';
                            } else {
                                getSelectedJob = 'None';
                            }
                            return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                                'display_type': 'bot',
                                'created_date': mDate,
                                'extra_data': 'result',
                                'text': `Here's the latest <b>${getSelectedJob}</b> jobs available.`
                            }).then(t => {
                                return saveUserJobPreference(roomId, 'location', user_text).then(u => {
                                    return analyseResponse(getSelectedJob.toLowerCase(), roomId, 'result');
                                });
                            });
                        });
                    } else {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'location',
                            'text': 'Sorry, that location is not available at the moment.'
                        }).then(t => {
                            const keyId2 = `${snapshot.ref.ref.push().key}`;
                            return admin.database().ref(`rooms/${roomId}/messages`).child(keyId2).set({
                                'display_type': 'bot',
                                'created_date': mDate,
                                'extra_data': 'location',
                                'text': 'What location will you prefer?<br><br>[Abuja]<br>[Lagos]<br>[Port Harcourt]'
                            });
                        });
                    }
                } else if (extra_data == 'result') {
                    if (positiveResponse.search(user_text) > 0) {
                        return getUserJobSelected(roomId).then(result => {
                            const _getSelectedJob = result.val();
                            return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                                'display_type': 'bot',
                                'created_date': mDate,
                                'extra_data': 'satisfaction1',
                                'link': getLink(_getSelectedJob.toLowerCase()),
                                'text': getSkillSetLinks(_getSelectedJob.toLowerCase())
                            }).then(u => {
                                const keyId2 = `${snapshot.ref.ref.push().key}`;
                                return admin.database().ref(`rooms/${roomId}/messages`).child(keyId2).set({
                                    'display_type': 'bot',
                                    'created_date': mDate,
                                    'extra_data': 'satisfaction',
                                    'text': "After learning and earning certifications in about three of the courses, you are required to upload them on your profile in order to boost your talent ranking."
                                }).then(m => {
                                    const keyId3 = `${snapshot.ref.ref.push().key}`;
                                    return admin.database().ref(`rooms/${roomId}/messages`).child(keyId3).set({
                                        'display_type': 'bot',
                                        'created_date': mDate,
                                        'extra_data': 'satisfaction',
                                        'text': "Are you satisfied with our assistance so far?"
                                    });
                                })

                            })
                        });
                    } else {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'job_field',
                            'text': "Alright then, would you like to select another job field?. Please make another selection from the following fields<br><br>1. IT & Software<br>2. Accounting<br>3. Agriculture<br> 4. Sales"
                        });
                    }
                } else if (extra_data == 'job_field') {
                    if (positiveResponse.search(user_text) > 0) {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'field',
                            'text': "Please choose any of these fields so we can assist you further.<br><br>1. IT & Software<br>2. Accounting<br>3. Agriculture<br> 4. Sales"
                        });
                    } else {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'text': "It seems I may not be of much assistance to you at this time, come back anytime. Thank you and please refer us to a friend."
                        }).then(u => {
                            const keyId2 = `${snapshot.ref.ref.push().key}`;
                            return admin.database().ref(`rooms/${roomId}/messages`).child(keyId2).set({
                                'display_type': 'bot',
                                'created_date': mDate,
                                'text': "To get started again, text <b>'help'</b>."
                            });
                        });
                    }
                } else if (extra_data == 'satisfaction') {
                    if (positiveResponse.search(user_text) > 0) {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'help',
                            'text': "I'm glad. Will there be anything else we can help you with?<br>If there is, reply with <b>'help'</b> to get started."
                        });
                    } else {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'switch',
                            'text': "How else can we help you, should I switch?<br>[Switch to Employer] <br>[No let's move on] <br>[I'm satisfied at the moment]"
                        });
                    }
                } else if (extra_data == 'help') {
                    if (user_text.includes("no")) {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'text': "Cool, come back anytime, and please do not forget to refer us to your friends. <br>Help us help your friends.<br> Thank you"
                        });
                    } else {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'text': "These are the only areas I can assist you with.<br>Are you a job seeker or an employer?<br>[Job seeker]<br>[Employer]"
                        });
                    }
                } else if (extra_data == 'switch') {
                    if (user_text.includes("employer") || positiveResponse.search(user_text) > 0) {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'continue',
                            'text': "Sorry we are still assisting job seekers in acquiring the right skills, soon as a good number passes necessary requirements we will make them available."
                        }).then(t => {
                            const keyId2 = `${snapshot.ref.ref.push().key}`;
                            return admin.database().ref(`rooms/${roomId}/messages`).child(keyId2).set({
                                'display_type': 'bot',
                                'created_date': mDate,
                                'extra_data': 'continue',
                                'text': "How would you like to continue?<br>As a Job seeker?"
                            });
                        });
                    } else if (user_text.includes("move") || user_text.includes("no")) {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'text': "Hi I am Tara, your talent and career assistant.<br>Are you a job seeker or an employer?<br>[Job seeker]<br>[Employer]"
                        });
                    } else if (user_text.includes("satisfied") || user_text.includes("moment")) {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'text': "Thank you. <br>Reply with help to get started."
                        });
                    } else {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'switch',
                            'text': "Sorry, I didn't get that.<br>How else can we help you, should I switch?<br>[Switch to Employer] <br>[No let's move on] <br>[I'm satisfied at the moment]"
                        })
                    }
                } else if (extra_data == 'continue') {
                    if (positiveResponse.search(user_text) > 0) {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'extra_data': 'experience',
                            'text': "For how long have you worked professionally?<br>[0]<br>[less than 6 months]<br>[1 year]<br>[2 years]<br>[3 years]<br>[3+ years]"
                        });
                    } else {
                        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                            'display_type': 'bot',
                            'created_date': mDate,
                            'text': "It seems I may not be of much assistance to you at this time, come back anytime. Thank you and please refer a friend to us."
                        }).then(u => {
                            const keyId2 = `${snapshot.ref.ref.push().key}`;
                            return admin.database().ref(`rooms/${roomId}/messages`).child(keyId2).set({
                                'display_type': 'bot',
                                'created_date': mDate,
                                'text': "To get started again, text <b>'help'</b>."
                            });
                        });
                    }
                }
                else {
                    return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                        'display_type': 'bot',
                        'created_date': mDate,
                        'text': "Hi I am Tara, your talent and career assistant.<br>Are you a job seeker or an employer?<br>[Job seeker]<br>[Employer]"
                    });
                }
            }
        } else {
            const search_resp = "fine thank you good ok okay k kk awesome wonderful not bad";

            if (user_text.includes("hi") || user_text.includes("hello") || user_text.includes("what's up") || user_text.includes("good morning")) {
                const response = "Hi, how do you do?";
                //const rand = Math.floor(Math.random() * (responses.length - 1)) + 0;
                return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'text': response
                });

            } else if (search_resp.search(user_text) > 0) {
                return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'text': "Cool, good to meet you. I am Tara, your talent and career assistant.<br>Are you a job seeker or an employer?<br>[Job seeker]<br>[Employer]"
                });
            }else if (user_text.includes("help")) { //

                return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'text': "Hi I am Tara, your talent and career assistant.<br>Are you a job seeker or an employer?<br>[Job seeker]<br>[Employer]"
                });
            }
            else if (user_text.includes("sign in")) {
                return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'text': "Hi I am Tara, your talent and career assistant.<br>Are you a job seeker or an employer?<br>[Job seeker]<br>[Employer]"
                });
            } else if (user_text.includes("created account")) {
                return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'text': 'Thank you for creating an account with us.'
                }).then(u => {
                    const keyId2 = `${snapshot.ref.ref.push().key}`;
                    return admin.database().ref(`rooms/${roomId}/messages`).child(keyId2).set({
                        'display_type': 'bot',
                        'created_date': mDate,
                        'text': "Hi I am Tara, your talent and career assistant.<br>Are you a job seeker or an employer?<br>[Job seeker]<br>[Employer]"
                    });
                });
            } else if (user_text.includes("job seeker") || user_text.includes("job") || user_text.includes("undergraduate") || user_text.includes("graduate")) {
                return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'extra_data': 'experience',
                    'text': "For how long have you worked professionally?<br>[0]<br>[less than 6 months]<br>[1 year]<br>[2 years]<br>[3 years]<br>[3+ years]"
                });
            } else if (user_text.includes("employer")) {
                return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'text': "Sorry we are still assisting job seekers in acquiring the right skills, soon as a good number passes necessary requirements we will make them available."
                }).then(t => {
                    const keyId2 = `${snapshot.ref.ref.push().key}`;
                    return admin.database().ref(`rooms/${roomId}/messages`).child(keyId2).set({
                        'display_type': 'bot',
                        'created_date': mDate,
                        'extra_data': 'continue',
                        'text': "How would you like to continue?<br>As a Job seeker?"
                    });
                });
            } else {
                return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'text': 'Sorry, how can I help you?'
                });
            }
        }
    } else {
        return null;
    }
})

function getUserJobSelected(roomId: any): Promise<admin.database.DataSnapshot> {
    return admin.database().ref(`rooms/${roomId}/settings/job`).once('value', snapshot => {
        return snapshot;
    });
}

function saveUserJobPreference(roomId: any, key: string, value: string): Promise<void> {
    if (key == 'job') {
        return admin.database().ref(`rooms/${roomId}/settings`).update({ 'job': value });
    } else {
        return admin.database().ref(`rooms/${roomId}/settings`).update({ 'location': value });
    }
}

// function replyUserAfterJobAndLocationCollection(roomId: any, extra_data: string): Promise<void> {
//     var job_selected = '';
//     //var location_selected = '';
//     return admin.database().ref(`rooms/${roomId}/settings`).once('value', snapshot => {
//         const v = snapshot.val();
//         job_selected = v['job'];
//         //location_selected = v['location'];
//     }).then(t => {
//         return analyseResponse(job_selected.toLowerCase(), roomId, extra_data);
//     });
// }

function analyseResponse(job_selected: string, roomId: any, extra_data: string): Promise<void> {
    const mDate = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    const keyId = `${admin.database().ref().push().key}`;

    if (job_selected == '1' || job_selected.includes('it & software')) {
        return admin.database().ref(`rooms/${roomId}/messages/${keyId}`).set({
            'display_type': 'bot',
            'created_date': mDate,
            'extra_data': 'result',
            'text': returnSearchReult(1)
        }).then(u => {
            const keyId2 = `${admin.database().ref().push().key}`;
            return admin.database().ref(`rooms/${roomId}/messages/${keyId2}`).set({
                'display_type': 'bot',
                'created_date': mDate,
                'extra_data': 'result',
                'text': returnSkillRequiredForJob(1)
            }).then(m => {
                const keyId3 = `${admin.database().ref().push().key}`;
                return admin.database().ref(`rooms/${roomId}/messages/${keyId3}`).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'extra_data': 'result',
                    'text': 'Do you want too proceed to acquire these skills and be appropriately fit to apply for these jobs?'
                });
            })
        });
    } else if (job_selected == '2' || job_selected.includes('accounting')) {
        return admin.database().ref(`rooms/${roomId}/messages/${keyId}`).set({
            'display_type': 'bot',
            'created_date': mDate,
            'extra_data': 'result',
            'text': returnSearchReult(2)
        }).then(u => {
            const keyId2 = `${admin.database().ref().push().key}`;
            return admin.database().ref(`rooms/${roomId}/messages/${keyId2}`).set({
                'display_type': 'bot',
                'created_date': mDate,
                'extra_data': 'result',
                'text': returnSkillRequiredForJob(2)
            }).then(m => {
                const keyId3 = `${admin.database().ref().push().key}`;
                return admin.database().ref(`rooms/${roomId}/messages/${keyId3}`).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'extra_data': 'result',
                    'text': 'Do you want too proceed to acquire these skills and be appropriately fit to apply for these jobs?'
                })
            });
        });
    } else if (job_selected == '3' || job_selected.includes('agriculture')) {
        return admin.database().ref(`rooms/${roomId}/messages/${keyId}`).set({
            'display_type': 'bot',
            'created_date': mDate,
            'extra_data': 'result',
            'text': returnSearchReult(3)
        }).then(u => {
            const keyId2 = `${admin.database().ref().push().key}`;
            return admin.database().ref(`rooms/${roomId}/messages/${keyId2}`).set({
                'display_type': 'bot',
                'created_date': mDate,
                'extra_data': 'result',
                'text': returnSkillRequiredForJob(3)
            }).then(m => {
                const keyId3 = `${admin.database().ref().push().key}`;
                return admin.database().ref(`rooms/${roomId}/messages/${keyId3}`).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'extra_data': 'result',
                    'text': 'Do you want too proceed to acquire these skills and be appropriately fit to apply for these jobs?'
                })
            });
        });
    } else if (job_selected == '4' || job_selected.includes('sales')) {
        return admin.database().ref(`rooms/${roomId}/messages/${keyId}`).set({
            'display_type': 'bot',
            'created_date': mDate,
            'extra_data': 'result',
            'text': returnSearchReult(4)
        }).then(u => {
            const keyId2 = `${admin.database().ref().push().key}`;
            return admin.database().ref(`rooms/${roomId}/messages/${keyId2}`).set({
                'display_type': 'bot',
                'created_date': mDate,
                'extra_data': 'result',
                'text': returnSkillRequiredForJob(4)
            }).then(m => {
                const keyId3 = `${admin.database().ref().push().key}`;
                return admin.database().ref(`rooms/${roomId}/messages/${keyId3}`).set({
                    'display_type': 'bot',
                    'created_date': mDate,
                    'extra_data': 'result',
                    'text': 'Do you want too proceed to acquire these skills and be appropriately fit to apply for these jobs?'
                });
            });
        });
    } else {
        return admin.database().ref(`rooms/${roomId}/messages`).child(keyId).set({
            'display_type': 'bot',
            'created_date': mDate,
            'extra_data': 'field',
            'text': 'Please select another job option.'
        }).then(t => {
            const keyId2 = `${admin.database().ref().push().key}`;
            return admin.database().ref(`rooms/${roomId}/messages`).child(keyId2).set({
                'display_type': 'bot',
                'created_date': mDate,
                'extra_data': 'field',
                'text': "Based on available jobs and ease of entry, we will like to recommend you switch to <b>IT & Software</b>.<br>However you can choose any of these fields.<br>1. IT & Software<br>2. Accounting<br>3. Agriculture<br> 4. Sales"
            })
        });
    }
}

function returnSearchReult(position: number): string {
    if (position == 1) {
        return `Based on your selection, these are the jobs we found:<br><ul>
         <li>Data base Administrator</li>
         <li>Young Java Developer Trainee</li>
         <li>Full-stack Java developer</li>
         </ul>`;
    } else if (position == 2) {
        return `Based on your selection, these are the jobs we found:<br><ul> 
        <li>Investor Relations Officer</li>
        <li>Accountant</li>
        <li>Credit (Loan) Analyst</li>
        </ul>`;
    } else if (position == 3) {
        return `Based on your selection, these are the jobs we found:<br><ul> 
        <li>Farm Manager</li>
        <li>Crop Farm Manager</li>
        <li>Field Agronomist</li>
        </ul>`;
    } else if (position == 4) {
        return `Based on your selection, these are the jobs we found:<br><ul>
        <li>Business Development Executive</li>
        <li>Sales Executive</li>
        <li>Key and Strategic Account Sales Manager</li>
         </ul>`;
    }
    else {
        return ``;
    }
}

function returnSkillRequiredForJob(position: number): string {
    if (position == 1) {
        return `And these are some of the skills required:<br><ul>
         <li>Knowledge of JSP, Servlet, MVC (Spring or Struts)</li>
         <li>Knowledge of HTML, CSS & Javascript</li>
         <li>Knowledge of JDBC or JPA</li>
         <li>Basic Knowledge of MySQL or Oracle Database</li>
         <li>Basic knowledge of graphics & web design</li>
         </ul>`;
    } else if (position == 2) {
        return `And these are some of the skills required:<br><ul>
        <li>Good presentation skills</li>
         <li>Financial analysis</li>
         <li>Time Management</li>
         <li>Team work</li>
         <li>Data analysis</li>
        </ul>`;
    } else if (position == 3) {
        return `And these are some of the skills required:<br><ul>
        <li>Knowledge of GIS mapping</li>
         <li>Master's Degree, Agronomist, or Breeder and related fields</li>
         <li>Good understanding of seed industry in target country and/or West Africa</li>
         <li>Relevant experience in agro-input sectors in target country</li>
         <li>At least 10 years’ experience in seed development and seed technology upscaling and adoption</li>
        </ul>`;
    } else if (position == 4) {
        return `And these are some of the skills required:<br><ul>
        <li>Good Communication and Interpersonal Skills</li>
        <li>Relationship management</li>
        <li>B2B Experience</li>
        <li>KAM Experience</li>
        <li>Marketing IP Telephony</li>
         </ul>`;
    }
    else {
        return ``;
    }
}

function getSkillSetLinks(job: string): string {
    if (job == '1' || job.includes('it & software')) {
        return `Here are links to where you can learn these skills <br><br><u>Coursera: Software Skills</u>`;
    } else if (job == '2' || job.includes('accounting')) {
        return `Here are links to where you can learn these skills <br><br><u>Coursera: Accounting Skills</u>`;
    } else if (job == '3' || job.includes('agriculture')) {
        return `Here are links to where you can learn these skills <br><br><u>Coursera: Agricultural Skills</u>`;
    } else if (job == '4' || job.includes('sales')) {
        return `Here are links to where you can learn these skills <br><br><u>Coursera: Sales Skills</u>`;
    }
    else {
        return ``;
    }
}

function getLink(job: string): string {
    if (job == '1' || job.includes('it & software')) {
        return `https://www.coursera.org/courses?query=software&`;
    } else if (job == '2' || job.includes('accounting')) {
        return `https://www.coursera.org/courses?query=accounting&page=1&configure%5BclickAnalytics%5D=true&indices%5Bprod_all_products%5D%5Bconfigure%5D%5BclickAnalytics%5D=true&indices%5Bprod_all_products%5D%5Bconfigure%5D%5BhitsPerPage%5D=10`;
    } else if (job == '3' || job.includes('agriculture')) {
        return `https://www.coursera.org/courses?query=agriculture&page=1&configure%5BclickAnalytics%5D=true&indices%5Bprod_all_products%5D%5Bconfigure%5D%5BclickAnalytics%5D=true&indices%5Bprod_all_products%5D%5Bconfigure%5D%5BhitsPerPage%5D=10`;
    } else if (job == '4' || job.includes('sales')) {
        return `https://www.coursera.org/courses?query=sales&page=1&configure%5BclickAnalytics%5D=true&indices%5Bprod_all_products%5D%5Bconfigure%5D%5BclickAnalytics%5D=true&indices%5Bprod_all_products%5D%5Bconfigure%5D%5BhitsPerPage%5D=10`;
    }
    else {
        return ``;
    }
}