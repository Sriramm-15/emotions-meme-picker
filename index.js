import { catsData } from './data.js' // Changed to a relative path

document.addEventListener('DOMContentLoaded', function() {
    const emotionRadios = document.getElementById('emotion-radios')
    const getImageBtn = document.getElementById('get-image-btn')
    const gifsOnlyOption = document.getElementById('gifs-only-option')
    const nonAnimatedOnlyOption = document.getElementById('non-animated-only-option')
    const memeModalInner = document.getElementById('meme-modal-inner')
    const memeModal = document.getElementById('meme-modal')
    const memeModalCloseBtn = document.getElementById('meme-modal-close-btn')

    // Store favorites and current cat
    let favoritesCats = []
    let currentCat = null

    // Ensure only one checkbox can be selected
    gifsOnlyOption.addEventListener('change', () => {
        if (gifsOnlyOption.checked) {
            nonAnimatedOnlyOption.checked = false;
        }
    });

    nonAnimatedOnlyOption.addEventListener('change', () => {
        if (nonAnimatedOnlyOption.checked) {
            gifsOnlyOption.checked = false;
        }
    });

    emotionRadios.addEventListener('change', highlightCheckedOption)
    memeModalCloseBtn.addEventListener('click', closeModal)

    // Add click outside to close modal functionality
    memeModal.addEventListener('click', function(e) {
        if (e.target === memeModal) {
            closeModal()
        }
    })

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Space bar to get new cat (when modal is closed)
        if (e.code === 'Space' && memeModal.style.display !== 'flex') {
            e.preventDefault()
            renderCat()
        }
        // Escape to close modal
        if (e.code === 'Escape' && memeModal.style.display === 'flex') {
            closeModal()
        }
        // F key to favorite current cat
        if (e.code === 'KeyF' && memeModal.style.display === 'flex' && currentCat) {
            e.preventDefault()
            toggleFavorite()
        }
    })

    getImageBtn.addEventListener('click', renderCat)

    function highlightCheckedOption(e){
        const radios = document.getElementsByClassName('radio')
        for (let radio of radios){
            radio.classList.remove('highlight')
        }
        document.getElementById(e.target.id).parentElement.classList.add('highlight')
    }

    function closeModal(){
        memeModal.style.display = 'none'
        currentCat = null
    }

    function renderCat(){
        const catObject = getSingleCatObject()
        currentCat = catObject
        
        const isFavorited = favoritesCats.some(fav => fav.image === catObject.image)
        const heartIcon = isFavorited ? '❤️' : '🤍'
        
        // Clear and rebuild the modal content
        memeModalInner.innerHTML = `
            <img 
                class="cat-img" 
                src="./images/${catObject.image}"
                alt="${catObject.alt}"
            >
        `
        
        // Add favorite button after image loads
        const favoriteBtn = document.createElement('button')
        favoriteBtn.className = 'favorite-btn'
        favoriteBtn.innerHTML = heartIcon
        favoriteBtn.title = 'Add to favorites (Press F)'
        favoriteBtn.style.cssText = `
            position: absolute;
            top: 15px;
            left: 15px;
            background: rgba(255, 255, 255, 0.95);
            border: none;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            font-size: 24px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        `
        favoriteBtn.addEventListener('click', toggleFavorite)
        
        // Add info section
        const infoDiv = document.createElement('div')
        infoDiv.className = 'cat-info'
        infoDiv.style.cssText = `
            position: absolute;
            bottom: 15px;
            left: 15px;
            right: 15px;
            text-align: center;
            background-color: rgba(255, 255, 255, 0.9);
            padding: 10px 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `
        infoDiv.innerHTML = `
            <p style="font-size: 18px; font-weight: bold; color: #67595e; margin: 0 0 5px 0;">${getEmotionFromCat(catObject)}</p>
            <p style="font-size: 14px; color: #888; margin: 0;">${catObject.isGif ? 'Animated GIF' : 'Image'}</p>
        `
        
        // Add elements to modal
        memeModalInner.appendChild(favoriteBtn)
        memeModalInner.appendChild(infoDiv)
        
        memeModal.style.display = 'flex'
        
        console.log('Modal rendered with favorite button') // Debug log
    }

    function toggleFavorite() {
        if (!currentCat) return
        
        const existingIndex = favoritesCats.findIndex(fav => fav.image === currentCat.image)
        
        if (existingIndex > -1) {
            // Remove from favorites
            favoritesCats.splice(existingIndex, 1)
            showNotification('Removed from favorites', '💔')
        } else {
            // Add to favorites
            favoritesCats.push({...currentCat})
            showNotification('Added to favorites!', '❤️')
        }
        
        // Update the button text to show new count
        updateButtonText()
        
        // Re-render the current cat to update heart icon
        if (currentCat) {
            renderCat()
        }
    }

    function updateButtonText() {
        if (favoritesCats.length > 0) {
            getImageBtn.textContent = `Get Cat (${favoritesCats.length} ❤️)`
        } else {
            getImageBtn.textContent = 'Get Image'
        }
    }

    function showNotification(message, icon) {
        // Create notification element
        const notification = document.createElement('div')
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #67595e;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 1001;
            font-size: 14px;
            max-width: 250px;
            animation: slideIn 0.3s ease-out;
        `
        notification.innerHTML = `${icon} ${message}`
        
        // Add CSS for animation
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style')
            style.id = 'notification-styles'
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `
            document.head.appendChild(style)
        }
        
        document.body.appendChild(notification)
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification)
            }
        }, 3000)
    }

    function getEmotionFromCat(cat) {
        return cat.emotionTags[0] || 'Happy'
    }

    function getSingleCatObject(){
        const catsArray = getMatchingCatsArray()
        
        if(catsArray.length === 1){
            return catsArray[0]
        }
        else{
            const randomNumber = Math.floor(Math.random() * catsArray.length)
            return catsArray[randomNumber]
        }
    }

    function getMatchingCatsArray(){     
        if(document.querySelector('input[type="radio"]:checked')){
            const selectedEmotion = document.querySelector('input[type="radio"]:checked').value
            const gifsOnly = gifsOnlyOption && gifsOnlyOption.checked
            const nonAnimatedOnly = nonAnimatedOnlyOption && nonAnimatedOnlyOption.checked
            
            const matchingCatsArray = catsData.filter(function(cat){
                const emotionMatch = cat.emotionTags.includes(selectedEmotion)
                
                if(gifsOnly && nonAnimatedOnly) {
                    return emotionMatch
                }
                else if(gifsOnly) {
                    return emotionMatch && cat.isGif
                }
                else if(nonAnimatedOnly) {
                    return emotionMatch && !cat.isGif
                }
                else {
                    return emotionMatch
                }
            })

            return matchingCatsArray 
        }
        return []
    }

    function getEmotionsArray(cats){
        const emotionsArray = []     
        for (let cat of cats){
            for (let emotion of cat.emotionTags){
                if (!emotionsArray.includes(emotion)){
                    emotionsArray.push(emotion)
                }
            }
        }
        return emotionsArray
    }

    function renderEmotionsRadios(cats){
        let radioItems = ``
        const emotions = getEmotionsArray(cats)
        for (let emotion of emotions){
            radioItems += `
            <div class="radio">
                <label for="${emotion}">${emotion}</label>
                <input
                type="radio"
                id="${emotion}"
                value="${emotion}"
                name="emotions"
                >
            </div>`
        }
        emotionRadios.innerHTML = radioItems
    }

    // Make function available globally for onclick
    window.toggleFavorite = toggleFavorite

    // Initialize
    renderEmotionsRadios(catsData)
    updateButtonText()
});