// Content loader module
const ContentLoader = {
    async loadJSON(path) {
        try {
            const response = await fetch(`assets/content/${path}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error loading ${path}:`, error);
            return null;
        }
    }
};

// Section manager module
const SectionManager = {
    async loadConfig() {
        return await ContentLoader.loadJSON('config.json');
    },

    async setupSections() {
        const config = await this.loadConfig();
        if (!config) return;

        // Sort sections by order
        const sortedSections = config.sections
            .filter(section => section.visible)
            .sort((a, b) => a.order - b.order);

        // Update navigation
        this.updateNavigation(sortedSections);

        // Reorder main content
        this.reorderSections(sortedSections);
    },

    updateNavigation(sections) {
        const nav = document.querySelector('nav');
        const aboutLink = '<a href="#about">About</a>';
        const contactLink = '<a href="#contact">Contact</a>';
        
        const sectionLinks = sections.map(section => 
            `<a href="#${section.id}">${section.title}</a>`
        ).join('');

        nav.innerHTML = `${aboutLink}${sectionLinks}${contactLink}`;
    },

    reorderSections(sections) {
        const main = document.querySelector('main');
        const aboutSection = document.getElementById('about');
        const contactSection = document.getElementById('contact');

        // Remove about and contact sections temporarily
        aboutSection.remove();
        contactSection.remove();

        // Reorder the middle sections
        sections.forEach(section => {
            const sectionElement = document.getElementById(section.id);
            if (sectionElement) {
                main.appendChild(sectionElement);
            }
        });

        // Put about and contact back in their fixed positions
        main.insertBefore(aboutSection, main.firstChild);
        main.appendChild(contactSection);
    }
};

// Content renderer module
const ContentRenderer = {
    async renderHeader() {
        const data = await ContentLoader.loadJSON('intro.json');
        if (!data) return;

        const headerContent = document.getElementById('header-content');
        headerContent.innerHTML = `
            <h1>${data.name}</h1>
            <div class="tags">
                ${data.details[0].split('•').map(tag => 
                    `<span class="tag">${tag}</span>`
                ).join('')}
            </div>
            <p class="location">${data.details[1]}</p>
        `;

        // Render social links in both header and footer
        const socialLinksHTML = data.socials.map(social => `
            <a href="${social.url}" 
               target="_blank" 
               rel="noopener noreferrer" 
               title="${social.name}">
                <i class="fab ${social.icon}"></i>
            </a>
        `).join('');

        const headerSocialLinks = document.getElementById('header-social-links');
        headerSocialLinks.innerHTML = socialLinksHTML;

        const footerSocialLinks = document.getElementById('social-links');
        footerSocialLinks.innerHTML = socialLinksHTML;
    },

    renderSocialLinks(socials) {
        const socialLinks = document.getElementById('social-links');
        socialLinks.innerHTML = socials.map(social => `
            <a href="${social.url}" target="_blank" title="${social.name}" rel="noopener noreferrer">
                <i class="fab ${social.icon}"></i>
            </a>
        `).join('');
    },

    async renderAbout() {
        const data = await ContentLoader.loadJSON('intro.json');
        if (!data) return;

        const aboutContent = document.getElementById('about-content');
        aboutContent.innerHTML = `<p>${data.description[0]}</p>`;
    },

    async renderExperience() {
        const data = await ContentLoader.loadJSON('experience.json');
        if (!data) return;

        const experienceContent = document.getElementById('experience-content');
        experienceContent.innerHTML = data.map(exp => {
            // Handle both single experience and positions array
            const experiences = exp.positions || [exp];
            
            return experiences.map(position => `
                <div class="exp-item">
                    <div class="exp-header">
                        <div>
                            <h3>${position.title} <span>@ ${position.company}</span></h3>
                            <div class="location">${position.location}</div>
                        </div>
                        <span class="date">${position.period || `${position.startDate} - ${position.endDate}`}</span>
                    </div>
                    <ul>
                        ${position.description.map(desc => `<li>${desc}</li>`).join('')}
                    </ul>
                    ${position.technologies ? `
                        <div class="technologies">
                            ${position.technologies.map(tech => `
                                <span class="tech-tag">${tech}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }).join('');
    },

    async renderEducation() {
        const data = await ContentLoader.loadJSON('education.json');
        if (!data) return;

        const educationContent = document.getElementById('education-content');
        educationContent.innerHTML = data.map(edu => `
            <div class="edu-item">
                <h3>${edu.title}</h3>
                <p>${edu.institution} | ${edu.startDate} - ${edu.endDate}</p>
                <p>${edu.description[0]}</p>
            </div>
        `).join('');
    },

    async renderInterests() {
        const data = await ContentLoader.loadJSON('interests.json');
        if (!data) return;

        const interestsContent = document.getElementById('interests-content');
        interestsContent.innerHTML = data.map(interest => `
            <div class="interest-item">
                <span class="icon">${interest.icon}</span>
                <h3>${interest.title}</h3>
                <p>${interest.description}</p>
            </div>
        `).join('');
    },

    async renderPublications() {
        const data = await ContentLoader.loadJSON('publications.json');
        if (!data) return;

        const publicationsContent = document.getElementById('publications-content');
        publicationsContent.innerHTML = data.map(pub => `
            <div class="publication-item">
                <a href="${pub.link}" target="_blank" rel="noopener noreferrer">
                    <h3 class="publication-title">${pub.title}</h3>
                </a>
                <div class="publication-meta">
                    ${pub.authors.join(', ')} | ${pub.conference} ${pub.year}
                </div>
                <p class="publication-description">${pub.description}</p>
                <div class="publication-tags">
                    ${pub.tags.map(tag => `
                        <span class="publication-tag">${tag}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    async renderContact() {
        const data = await ContentLoader.loadJSON('contact.json');
        if (!data) return;

        const contactContent = document.getElementById('contact-content');
        contactContent.innerHTML = `
            <p class="contact-description">${data.description}</p>
            <div class="contact-info">
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <a href="mailto:${data.email}" class="contact-email">${data.email}</a>
                </div>
                <div class="contact-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${data.location}</span>
                </div>
            </div>
            <p class="contact-availability">${data.availability}</p>
        `;
    }
};

// App initialization module
const App = {
    async init() {
        try {
            // First load and setup sections
            await SectionManager.setupSections();

            // Then render all content
            await Promise.all([
                ContentRenderer.renderHeader(),
                ContentRenderer.renderAbout(),
                ContentRenderer.renderExperience(),
                ContentRenderer.renderEducation(),
                ContentRenderer.renderInterests(),
                ContentRenderer.renderPublications(),
                ContentRenderer.renderContact()
            ]);
        } catch (error) {
            console.error('Error initializing content:', error);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init()); 