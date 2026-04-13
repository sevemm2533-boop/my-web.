document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Feedback System Logic
    const feedbackForm = document.getElementById('feedbackForm');
    const voteBtns = document.querySelectorAll('.vote-btn');
    const feedbackList = document.getElementById('feedbackList');
    const recommendCount = document.getElementById('recommendCount')?.querySelector('.count');
    const notRecommendCount = document.getElementById('notRecommendCount')?.querySelector('.count');

    // Modal Elements
    const deleteModal = document.getElementById('deleteModal');
    const confirmBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.getElementById('cancelDelete');

    let currentVote = 'up';
    let itemToDeleteIndex = null;

    // Vote Button Toggling
    voteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            voteBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentVote = btn.dataset.type;
        });
    });

    // Load Feedback from LocalStorage
    const loadFeedback = () => {
        if (!feedbackList) return;
        const feedbacks = JSON.parse(localStorage.getItem('portfolio_feedbacks') || '[]');
        feedbackList.innerHTML = '';
        
        let ups = 0;
        let downs = 0;

        feedbacks.forEach((item, index) => {
            if (item.vote === 'up') ups++; else downs++;

            const card = document.createElement('div');
            card.className = `comment-card ${item.vote}`;
            card.innerHTML = `
                <div class="comment-header">
                    <div style="flex: 1;">
                        <span class="comment-user">${item.name}</span>
                        <span class="comment-vote ${item.vote}">${item.vote === 'up' ? '추천 ↑' : '비추천 ↓'}</span>
                    </div>
                    <div class="comment-actions">
                        <button type="button" class="action-btn edit" data-index="${index}" title="수정"><i data-lucide="pencil"></i>수정</button>
                        <button type="button" class="action-btn delete" data-index="${index}" title="삭제"><i data-lucide="trash-2"></i>삭제</button>
                    </div>
                </div>
                <p class="comment-text">${item.text}</p>
            `;
            feedbackList.prepend(card);
        });

        if (recommendCount) recommendCount.textContent = ups;
        if (notRecommendCount) notRecommendCount.textContent = downs;

        // Re-initialize icons for new elements
        if (window.lucide) window.lucide.createIcons();

        // Event Listeners for Dynamic Buttons (Edit)
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const idx = btn.getAttribute('data-index');
                const feedback = feedbacks[idx];
                
                if (feedback) {
                    document.getElementById('visitorName').value = feedback.name;
                    document.getElementById('feedbackText').value = feedback.text;
                    document.getElementById('editId').value = idx;
                    
                    currentVote = feedback.vote;
                    voteBtns.forEach(b => {
                        b.classList.remove('active');
                        if (b.dataset.type === currentVote) b.classList.add('active');
                    });

                    feedbackForm.scrollIntoView({ behavior: 'smooth' });
                    document.querySelector('.submit-btn').textContent = '수정 완료하기';
                    document.querySelector('.submit-btn').style.background = '#4ade80';
                }
            });
        });

        // Event Listeners for Dynamic Buttons (Delete)
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                itemToDeleteIndex = btn.getAttribute('data-index');
                if (deleteModal) {
                    deleteModal.classList.add('active');
                }
            });
        });
    };

    // Modal Handle Logic (Setup once)
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (itemToDeleteIndex !== null) {
                const currentFeedbacks = JSON.parse(localStorage.getItem('portfolio_feedbacks') || '[]');
                currentFeedbacks.splice(parseInt(itemToDeleteIndex), 1);
                localStorage.setItem('portfolio_feedbacks', JSON.stringify(currentFeedbacks));
                
                if (deleteModal) deleteModal.classList.remove('active');
                itemToDeleteIndex = null;
                loadFeedback();
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (deleteModal) deleteModal.classList.remove('active');
            itemToDeleteIndex = null;
        });
    }

    // Modal Close on Overlay Click
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) {
                deleteModal.classList.remove('active');
                itemToDeleteIndex = null;
            }
        });
    }

    // Handle Form Submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('visitorName').value;
            const text = document.getElementById('feedbackText').value;
            const editId = document.getElementById('editId').value;

            let feedbacks = JSON.parse(localStorage.getItem('portfolio_feedbacks') || '[]');
            
            if (editId !== "") {
                // Update existing
                feedbacks[editId] = {
                    ...feedbacks[editId],
                    name,
                    text,
                    vote: currentVote,
                    lastEdit: new Date().toISOString()
                };
                document.getElementById('editId').value = "";
                document.querySelector('.submit-btn').textContent = '평가 등록하기';
                document.querySelector('.submit-btn').style.background = '';
            } else {
                // Add new
                feedbacks.push({
                    name,
                    text,
                    vote: currentVote,
                    date: new Date().toISOString()
                });
            }

            localStorage.setItem('portfolio_feedbacks', JSON.stringify(feedbacks));
            
            feedbackForm.reset();
            loadFeedback();
        });
    }

    // Smooth Scroll and Intersection Observer
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Reveal animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });

    loadFeedback();
});
